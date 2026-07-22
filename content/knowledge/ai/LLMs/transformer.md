---
title: Transformer
rank: 1
tags:
  - AI
  - Python
---

## Training

Consider the following example:

> Source sentence (encoder input):
> 
> 
> `Unbelievably, the hyperconnected exoskeleton malfunctioned.`
> 

> Target sentence (to be predicted at the decoder output):
> 
> 
> `Incroyablement, l’exosquelette hyperconnecté a dysfonctionné.`
> 

We define a training corpus containing the two sentences:

```python
source_corpus = ["Unbelievably, the hyperconnected exoskeleton malfunctioned."]
target_corpus = ["Incroyablement, l’exosquelette hyperconnecté a dysfonctionné."]

```

We use a BPE tokenizer with special tokens (`"<BOS>"`, `"<EOS>"`, `"[PAD]"`) that have
reserved IDs in the vocabulary:

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.trainers import BpeTrainer

# 1) define the BPE tokenizer
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# 2) train with the special tokens already fixed
trainer = BpeTrainer(
    vocab_size=37_000,
    special_tokens=["<BOS>", "<EOS>", "[PAD]"]
)
tokenizer.train_from_iterator(source_corpus + target_corpus, trainer)
```

### Encoder

#### Tokenization

We tokenize the source without adding any tags. This gives us the tokens and their indices
with respect to the vocabulary.

```python
encoding = tokenizer.encode(source_corpus)
tokens_enc = encoding.tokens
ids_enc    = encoding.ids
```

```python
[65, 3, 53, 68, 67, 69, 4]
```

#### Embeddings

We can then turn these indices into embeddings with `d_model` dimensions.

```python
class InputEmbeddings(nn.Module):

    def __init__(self, d_model: int, vocab_size: int) -> None:
        super().__init__()
        self.d_model = d_model
        self.vocab_size = vocab_size
        self.embedding = nn.Embedding(vocab_size, d_model)

    def forward(self, x):
        # (batch, seq_len) --> (batch, seq_len, d_model)
        # Multiply by sqrt(d_model) to scale the embeddings according to the paper
        return self.embedding(x) * math.sqrt(self.d_model)
```

#### Positional encoding

We encode the position of the embeddings. Assuming they sit in a tensor of shape
`(sequence_length, model_dimension)`, for $\text{pos}\in\llbracket 0,\text{sequence\_length}-1\rrbracket$ and $\text{i}\in\llbracket 0,\text{model\_dimension}-1\rrbracket$, we apply the following formula:

$$
x_{(\text{pos},i} \mathrel{+}= \text{PE}(\text{pos},i)

$$

with:

$$
\text{PE}(\text{pos},2i) = \sin\left(\frac{\text{pos}}{1000^{\frac{2i}{\text{model\_dimension}}}}\right)
$$

$$
\text{PE}(\text{pos},2i+1) = \cos\left(\frac{\text{pos}}{1000^{\frac{2i}{\text{model\_dimension}}}}\right)
$$

```python
class PositionalEncoding(nn.Module):

    def __init__(self, d_model: int, seq_len: int, dropout: float) -> None:
        super().__init__()
        self.d_model = d_model
        self.seq_len = seq_len
        self.dropout = nn.Dropout(dropout)
        # Create a matrix of shape (seq_len, d_model)
        pe = torch.zeros(seq_len, d_model)
        # Create a vector of shape (seq_len)
        position = torch.arange(0, seq_len, dtype=torch.float).unsqueeze(1) # (seq_len, 1)
        # Create a vector of shape (d_model)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)) # (d_model / 2)
        # Apply sine to even indices
        pe[:, 0::2] = torch.sin(position * div_term) # sin(position * (10000 ** (2i / d_model))
        # Apply cosine to odd indices
        pe[:, 1::2] = torch.cos(position * div_term) # cos(position * (10000 ** (2i / d_model))
        # Add a batch dimension to the positional encoding
        pe = pe.unsqueeze(0) # (1, seq_len, d_model)
        # Register the positional encoding as a buffer
        self.register_buffer('pe', pe)

    def forward(self, x):
        x = x + (self.pe[:, :x.shape[1], :]).requires_grad_(False) # (batch, seq_len, d_model)
        return self.dropout(x)
```

#### Attention

We can then pass these embeddings through the attention layers. We usually choose the
number of attention heads $H$.

For an attention head $h$, we multiply the queries using a dedicated weight matrix $W^Q_h \in \mathbb{R}^{\text{model\_dimension}\times d_k}$. Here, $d_k$ is the dimension of the keys (equal to that of the queries). This projects the embeddings from the `model_dimension` dimension down to `d_k` so that each head captures a different relationship. We therefore usually take $d_k = \frac{\text{model\_dimension}}{H}$.

$$
Q_h = XW_h^Q \in \mathbb{R}^{\text{sequence\_length}\times d_k}
$$

We then compute the keys in the same way, with a weight matrix $W^K_h \in \mathbb{R}^{\text{model\_dimension}\times d_k}$

$$
K_h = XW_h^K \in \mathbb{R}^{\text{sequence\_length}\times d_k}
$$

We then compute the similarity between the embeddings by measuring the distance between the queries and the keys. This gives a matrix of shape `(sequence_length, sequence_length)` where the element (i,j) means "how strongly token i (query) is drawn to token j (key)".

$$
\text{scores}_h = \frac{Q_hK_h^\text{T}}{\sqrt{d_k}} \in \mathbb{R}^{\text{sequence\_length}\times\text{sequence\_length}}
$$

But we want attention weights between 0 and 1 for each query, summing to 1 for a given
query. So we transform each row of the score matrix with a softmax:

$$
\text{attention}_h[i, j] = \frac{\exp(\text{scores}_h[i, j])}{\sum_{j'=1}^{T} \exp(\text{scores}_h[i, j'])}
$$

We then compute the content of each token, projected into `d_v` (usually equal to `d_k`), with a value matrix $W^V_h \in \mathbb{R}^{\text{model\_dimension}\times d_v}$:

$$
V_h = XW_h^V \in \mathbb{R}^{\text{sequence\_length}\times d_v}
$$

And we compute a new embedding of dimension `d_v` that corresponds to the projected content
weighted by the attention:

$$
\text{output}_h = \text{attention}_h .V_h\in \mathbb{R}^{\text{sequence\_length}\times d_v}
$$

We then concatenate everything across all of the attention heads. Normally, $H.d_v = \text{model\_dimension}$.

$$
\text{output} = \text{concat}(\text{output}_1, \text{output}_2, \dots, \text{output}_H) \in \mathbb{R}^{\text{sequence\_length}\times (H.d_v)}
$$

Then we make sure to get back to a shape of `(sequence_length, model_dimension)` regardless, using a third weight matrix $W^O \in \mathbb{R}^{(H.d_v)\times\text{model\_dimension}}$:

$$
\text{final\_output} = \text{output}.W^O\in \mathbb{R}^{\text{sequence\_length}\times\text{model\_dimension}}
$$

```python
class MultiHeadAttentionBlock(nn.Module):

    def __init__(self, d_model: int, h: int, dropout: float) -> None:
        super().__init__()
        self.d_model = d_model # Embedding vector size
        self.h = h # Number of heads
        # Make sure d_model is divisible by h
        assert d_model % h == 0, "d_model is not divisible by h"

        self.d_k = d_model // h # Dimension of vector seen by each head
        self.w_q = nn.Linear(d_model, d_model, bias=False) # Wq
        self.w_k = nn.Linear(d_model, d_model, bias=False) # Wk
        self.w_v = nn.Linear(d_model, d_model, bias=False) # Wv
        self.w_o = nn.Linear(d_model, d_model, bias=False) # Wo
        self.dropout = nn.Dropout(dropout)

    @staticmethod
    def attention(query, key, value, mask, dropout: nn.Dropout):
        d_k = query.shape[-1]
        # Just apply the formula from the paper
        # (batch, h, seq_len, d_k) --> (batch, h, seq_len, seq_len)
        attention_scores = (query @ key.transpose(-2, -1)) / math.sqrt(d_k)
        if mask is not None:
            # Write a very low value (indicating -inf) to the positions where mask == 0
            attention_scores.masked_fill_(mask == 0, -1e9)
        attention_scores = attention_scores.softmax(dim=-1) # (batch, h, seq_len, seq_len) # Apply softmax
        if dropout is not None:
            attention_scores = dropout(attention_scores)
        # (batch, h, seq_len, seq_len) --> (batch, h, seq_len, d_k)
        # return attention scores which can be used for visualization
        return (attention_scores @ value), attention_scores

    def forward(self, q, k, v, mask):
        query = self.w_q(q) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)
        key = self.w_k(k) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)
        value = self.w_v(v) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)

        # (batch, seq_len, d_model) --> (batch, seq_len, h, d_k) --> (batch, h, seq_len, d_k)
        query = query.view(query.shape[0], query.shape[1], self.h, self.d_k).transpose(1, 2)
        key = key.view(key.shape[0], key.shape[1], self.h, self.d_k).transpose(1, 2)
        value = value.view(value.shape[0], value.shape[1], self.h, self.d_k).transpose(1, 2)

        # Calculate attention
        x, self.attention_scores = MultiHeadAttentionBlock.attention(query, key, value, mask, self.dropout)
        
        # Combine all the heads together
        # (batch, h, seq_len, d_k) --> (batch, seq_len, h, d_k) --> (batch, seq_len, d_model)
        x = x.transpose(1, 2).contiguous().view(x.shape[0], -1, self.h * self.d_k)

        # Multiply by Wo
        # (batch, seq_len, d_model) --> (batch, seq_len, d_model)  
        return self.w_o(x)
```

#### Normalisation

Next we normalise. For a given embedding, we compute its mean and standard deviation:

$$
\mu = \frac{1}{d_{\text{model}}} \sum_{i=1}^{d_{\text{model}}} x_i
$$

$$
\sigma = \sqrt{\frac{1}{d_{\text{model}}} \sum_{i=1}^{d_{\text{model}}} (x_i - \mu)^2}
$$

We normalise each dimension of the embedding:

$$
\hat{x}_i = \frac{x_i - \mu}{\sigma}
$$

Then we apply a transformation using weights $\gamma, \beta \in \mathbb{R}^{d_{\text{model}}}$:

$$
\text{LayerNorm}(x)_i = \gamma_i \cdot \hat{x}_i + \beta_i
$$

```python
class LayerNormalization(nn.Module):

    def __init__(self, features: int, eps:float=10**-6) -> None:
        super().__init__()
        self.eps = eps
        self.alpha = nn.Parameter(torch.ones(features)) # alpha is a learnable parameter
        self.bias = nn.Parameter(torch.zeros(features)) # bias is a learnable parameter

    def forward(self, x):
        # x: (batch, seq_len, hidden_size)
         # Keep the dimension for broadcasting
        mean = x.mean(dim = -1, keepdim = True) # (batch, seq_len, 1)
        # Keep the dimension for broadcasting
        std = x.std(dim = -1, keepdim = True) # (batch, seq_len, 1)
        # eps is to prevent dividing by zero or when std is very small
        return self.alpha * (x - mean) / (std + self.eps) + self.bias__init__ method:
```

#### Residual connection

To whatever enters the attention, we add the normalised attention output with a dropout
applied.

#### Feed-Forward

The same MLP is applied **independently** to each embedding $(d_{\text{model}})$ at each position in the batch. It takes as input a vector of dimension $x \in \mathbb{R}^{d_{\text{model}}}$ and applies two linear layers ($W_1 \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ff}}}$ and $W_2 \in \mathbb{R}^{d_{\text{ff}} \times d_{\text{model}}}$) separated by a ReLU:

$$
\text{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2
$$

```python
class FeedForwardBlock(nn.Module):

    def __init__(self, d_model: int, d_ff: int, dropout: float) -> None:
        super().__init__()
        self.linear_1 = nn.Linear(d_model, d_ff) # w1 and b1
        self.dropout = nn.Dropout(dropout)
        self.linear_2 = nn.Linear(d_ff, d_model) # w2 and b2

    def forward(self, x):
        # (batch, seq_len, d_model) --> (batch, seq_len, d_ff) --> (batch, seq_len, d_model)
        return self.linear_2(self.dropout(torch.relu(self.linear_1(x))))
```

#### Residual connection

To whatever enters the feed-forward, we add the normalised feed-forward output with a
dropout applied.

#### Repeating the encoder block

Whatever comes out of the residual connection can go back into a residual connection
containing attention, and this mechanism can be repeated. At the encoder output, we get
embeddings of dimension `model_dimension`.

### Decoder

#### Input

During training, we give the decoder the target sentence shifted right, adding the special
`<BOS>` tag at the beginning. This shift lets it learn to predict each token from the
preceding ones.

> "<BOS> Incroyablement, l’exosquelette hyperconnecté a dysfonctionné."
> 

#### Tokenization

We tokenize the target sequence with the `<BOS>` tag added:

```python
decoding = tokenizer.encode("<BOS> Incroyablement, l’exosquelette hyperconnecté a dysfonctionné.")
tokens_dec = decoding.tokens
ids_dec    = decoding.ids
```

```python
[1, 12, 5, 22, 45, 88, 67, 14, 33, 6]
```

This gives us the input token IDs for the decoder.

#### Embeddings

Same as for the encoder.

#### Positional encoding

Same as for the encoder.

#### Masked Attention

We do the same as for the encoder attention, except that we apply a mask to prevent each
query from seeing the keys located after it in the sequence. So we generate a mask:

$$
\underbrace{
\begin{bmatrix}
1 & 0 & 0 & 0 \\
1 & 1 & 0 & 0 \\
1 & 1 & 1 & 0 \\
1 & 1 & 1 & 1 \\
\end{bmatrix}
}_{\text{seq\_len} \times \text{seq\_len}}
$$

```python
def generate_subsequent_mask(seq_len: int) -> torch.Tensor:
    # (1, 1, seq_len, seq_len) : broadcasting ok pour batch et têtes
    return torch.tril(torch.ones((1, 1, seq_len, seq_len))).bool()
```

The zero positions are replaced with $-\infty$ before the softmax, and will therefore give a null attention score. That way, each output embedding has information about the preceding embeddings, but not the following ones.

#### Normalisation

Same as for the encoder.

#### Residual connection

Same as for the encoder.

#### Encoder-decoder attention

We apply a standard attention **without a mask**, where:

- The **queries** come from the **decoder output** (written $X_{\text{dec}}$).
- The **keys** and **values** come from the **final encoder output** (written $X_{\text{enc}}$).

For each head $h$, we apply the following projections:

$$
Q_h = X_{\text{dec}} W_h^Q \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times d_k} \quad \text{avec} \quad W^Q_h \in \mathbb{R}^{d_{\text{model}} \times d_k}
$$

$$
K_h = X_{\text{enc}} W_h^K \in \mathbb{R}^{\text{sequence\_length}_{\text{enc}} \times d_k} \quad \text{avec} \quad W_h^K \in \mathbb{R}^{d_{\text{model}} \times d_k}

$$

$$
V_h = X_{\text{enc}} W_h^V \in \mathbb{R}^{\text{sequence\_length}_{\text{enc}} \times d_v} \quad \text{avec} \quad W_h^V \in \mathbb{R}^{d_{\text{model}} \times d_v}

$$

$$
\text{scores}_h = \frac{Q_h K_h^\top}{\sqrt{d_k}} \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times \text{sequence\_length}_{\text{enc}}}

$$

$$
\text{attention}_h[i, j] = \frac{\exp(\text{scores}_h[i, j])}{\sum_{j'=1}^{T} \exp(\text{scores}_h[i, j'])}

$$

$$
\text{output}_h = \text{attention}_h \cdot V_h \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times d_v}
$$

$$
\text{output} = \text{concat}(\text{output}_1, \dots, \text{output}_H) \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times (H \cdot d_v)}
$$

$$
\text{final\_output} = \text{output} \cdot W^O \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times d_{\text{model}}} \quad \text{avec} \quad W^O \in \mathbb{R}^{(H \cdot d_v) \times d_{\text{model}}}
$$

#### Normalisation

Same as for the encoder.

#### Residual connection

Same as for the encoder.

#### Feed-forward

Same as for the encoder.

#### Residual connection

Same as for the encoder.

#### Repeating the decoder block

Whatever comes out of the residual connection can go back into a residual connection
containing attention, and this mechanism can be repeated. At the decoder output, we get
embeddings of dimension `model_dimension`.

### Projection onto the vocabulary

At the decoder output, we get a tensor of shape `(batch, sequence_length, model_dimension)`. We then apply a linear layer followed by a softmax to turn each embedding into a probability distribution over the vocabulary:

$$
\text{logits} = \text{final\_output} \cdot W^{\text{vocab}} + b^{\text{vocab}} \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times |\mathcal{V}|}
$$

$$
\text{probas} = \text{softmax}(\text{logits}) \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times |\mathcal{V}|}
$$

where:

- $W^{\text{vocab}} \in \mathbb{R}^{d_{\text{model}} \times |\mathcal{V}|}$
- $b^{\text{vocab}} \in \mathbb{R}^{|\mathcal{V}|}$
- $|\mathcal{V}|$ is the vocabulary size.

This yields a tensor of shape `(batch_size, sequence_length_dec, vocab_size)`.
