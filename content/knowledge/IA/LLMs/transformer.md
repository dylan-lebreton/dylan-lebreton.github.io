---
title: Transformer
rank: 1
tags:
  - IA
  - Python
---

## Entraînement

Soit l’exemple suivant :

> Phrase source (entrée de l’encodeur) :
> 
> 
> `Unbelievably, the hyperconnected exoskeleton malfunctioned.`
> 

> Phrase cible (à prédire en sortie du décodeur) :
> 
> 
> `Incroyablement, l’exosquelette hyperconnecté a dysfonctionné.`
> 

On définit un corpus d’entraînement contenant les deux phrases :

```python
source_corpus = ["Unbelievably, the hyperconnected exoskeleton malfunctioned."]
target_corpus = ["Incroyablement, l’exosquelette hyperconnecté a dysfonctionné."]

```

On utilise un tokenizer BPE avec des tokens spéciaux (`"<BOS>"`, `"<EOS>"`, `"[PAD]"`) ayant des IDs réservés dans le vocabulaire :

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.trainers import BpeTrainer

# 1) définir le tokenizer BPE
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# 2) entraîner avec les balises spéciales déjà fixées
trainer = BpeTrainer(
    vocab_size=37_000,
    special_tokens=["<BOS>", "<EOS>", "[PAD]"]
)
tokenizer.train_from_iterator(source_corpus + target_corpus, trainer)
```

### Encodeur

#### Tokenization

On tokenize la source sans ajouter de balises. On obtient alors les tokens et leurs index vis-à-vis du vocabulaire.

```python
encoding = tokenizer.encode(source_corpus)
tokens_enc = encoding.tokens
ids_enc    = encoding.ids
```

```python
[65, 3, 53, 68, 67, 69, 4]
```

#### Embeddings

On peut ensuite transformer ces indices en embeddings ayant `d_model` dimensions.

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

On encode la position des embeddings. En considérant qu’ils soient dans un tenseur de taille `(sequence_length, model_dimension)`, pour $\text{pos}\in\llbracket 0,\text{sequence\_length}-1\rrbracket$ et $\text{i}\in\llbracket 0,\text{model\_dimension}-1\rrbracket$, on applique la formule suivante :

$$
x_{(\text{pos},i} \mathrel{+}= \text{PE}(\text{pos},i)

$$

avec :

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

On peut ensuite passer ces embeddings dans les couches d’attention. On choisit généralement le nombre de têtes d’attention $H$. 

Pour une tête d’attention $h$, on multiplie les “queries” à l’aide d’une matrice de poids dédiée $W^Q_h \in \mathbb{R}^{\text{model\_dimension}\times d_k}$. Ici, $d_k$ est la dimension des “clés” (égale à celle des “queries”). Cela permet de projeter les embeddings de la dimension `model_dimension` vers `d_k` pour que chaque tête capture une relation différente. Généralement, on prend donc $d_k = \frac{\text{model\_dimension}}{H}$.

$$
Q_h = XW_h^Q \in \mathbb{R}^{\text{sequence\_length}\times d_k}
$$

On calcule ensuite les clés de la même manière, avec une matrice de poids $W^K_h \in \mathbb{R}^{\text{model\_dimension}\times d_k}$

$$
K_h = XW_h^K \in \mathbb{R}^{\text{sequence\_length}\times d_k}
$$

On calcule ensuite la similarité entre les embeddings en calculant la distance entre les requêtes et les clés. On obtient une matrice de taille `(sequence_length, sequence_length)`où l’élément (i,j) signifie “à quel point le token i (requête) est attiré par le token j (clé)”. 

$$
\text{scores}_h = \frac{Q_hK_h^\text{T}}{\sqrt{d_k}} \in \mathbb{R}^{\text{sequence\_length}\times\text{sequence\_length}}
$$

Mais on souhaite obtenir des poids d’attention entre 0 et 1 pour chaque requête et qui s’additionnent à 1 pour une requête donnée. On transforme donc chaque ligne de la matrice des scores avec une softmax :

$$
\text{attention}_h[i, j] = \frac{\exp(\text{scores}_h[i, j])}{\sum_{j'=1}^{T} \exp(\text{scores}_h[i, j'])}
$$

On calcule ensuite le contenu de chaque token projeté dans `d_v` (généralement égal à `d_k`) avec une matrice des valeurs $W^V_h \in \mathbb{R}^{\text{model\_dimension}\times d_v}$ :

$$
V_h = XW_h^V \in \mathbb{R}^{\text{sequence\_length}\times d_v}
$$

Et on calcule un nouvel embedding de dimension `d_v` qui correspond au contenu projet pondéré par l’attention :

$$
\text{output}_h = \text{attention}_h .V_h\in \mathbb{R}^{\text{sequence\_length}\times d_v}
$$

On concatene ensuite le tout pour toutes les têtes d’attention. Normalement, $H.d_v = \text{model\_dimension}$.

$$
\text{output} = \text{concat}(\text{output}_1, \text{output}_2, \dots, \text{output}_H) \in \mathbb{R}^{\text{sequence\_length}\times (H.d_v)}
$$

Puis on s’assure de revenir à une taille de `(sequence_length, model_dimension)`malgré tout à l’aide d’une troisième matrice de poids $W^O \in \mathbb{R}^{(H.d_v)\times\text{model\_dimension}}$ :

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

Ensuite on normalise. Pour un embedding donné, on calcule sa moyenne et son écart-type :

$$
\mu = \frac{1}{d_{\text{model}}} \sum_{i=1}^{d_{\text{model}}} x_i
$$

$$
\sigma = \sqrt{\frac{1}{d_{\text{model}}} \sum_{i=1}^{d_{\text{model}}} (x_i - \mu)^2}
$$

On normalise chaque dimension de l’embedding :

$$
\hat{x}_i = \frac{x_i - \mu}{\sigma}
$$

Puis on applique une transformation à l’aide de poids $\gamma, \beta \in \mathbb{R}^{d_{\text{model}}}$ :

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

#### Connexion résiduelle

À ce qui entre dans l’attention, on ajoute la sortie de l’attention normalisée et avec un dropout.

#### Feed-Forward

Un même MLP est appliqué **indépendamment** à chaque embedding $(d_{\text{model}})$ de chaque position du batch. Il prend en entrée un vecteur de dimension $x \in \mathbb{R}^{d_{\text{model}}}$ et applique deux couches linéaires ($W_1 \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ff}}}$ et $W_2 \in \mathbb{R}^{d_{\text{ff}} \times d_{\text{model}}}$) séparées par une ReLU :

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

#### Connexion résiduelle

À ce qui rentre dans le feed-forward, on ajoute la sortie du feed-forward normalisée et avec un dropout.

#### Répétition du block encodeur

Ce qui sort de la connexion résiduelle peut re-rentrer dans une connexion résiduelle contenant de l’attention, et ce mécanisme peut-être répété. On obtient, en sortie d’encodeur, des embeddings de dimension `model_dimension`.

### Décodeur

#### Entrée

Lors de l'entraînement, on donne au décodeur la phrase cible décalée à droite, en ajoutant la balise spéciale `<BOS>` au début. Ce décalage permet d’apprendre à prédire chaque token à partir des précédents.

> "<BOS> Incroyablement, l’exosquelette hyperconnecté a dysfonctionné."
> 

#### Tokenization

On tokenize la séquence cible avec ajout de la balise `<BOS>` :

```python
decoding = tokenizer.encode("<BOS> Incroyablement, l’exosquelette hyperconnecté a dysfonctionné.")
tokens_dec = decoding.tokens
ids_dec    = decoding.ids
```

```python
[1, 12, 5, 22, 45, 88, 67, 14, 33, 6]
```

On obtient ainsi les IDs des tokens d’entrée pour le décodeur.

#### Embeddings

Même chose que pour l’encodeur.

#### Postional encoding

Même chose que pour l’encodeur.

#### Masked Attention

On réalise la même chose que pour l’attention de l’encodeur, sauf qu’on applique un masque pour empêcher chaque requête de voir les clés situées après elle dans la séquence. On génère donc un masque :

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

Les positions nulles sont remplacées par $-\infty$ avant la softmax, et donneront donc un score d’attention nul. Ainsi, chaque embedding en sorti a une information sur les embeddings précédents, mais pas les suivants.

#### Normalisation

Même chose que pour l’encodeur.

#### Connexion résiduelle

Même chose que pour l’encodeur.

#### Attention encoder–decoder

On applique une attention classique **sans masque**, où :

- Les **requêtes** viennent de la **sortie du décodeur** (notée $X_{\text{dec}}$).
- Les **clés** et **valeurs** viennent de la **sortie finale de l’encodeur** (notée $X_{\text{enc}}$).

Pour chaque tête $h$, on applique les projections suivantes :

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

Même chose que pour l’encodeur.

#### Connexion résiduelle

Même chose que pour l’encodeur.

#### Feed-forward

Même chose que pour l’encodeur.

#### Connexion résiduelle

Même chose que pour l’encodeur.

#### Répétition du block décodeur

Ce qui sort de la connexion résiduelle peut re-rentrer dans une connexion résiduelle contenant de l’attention, et ce mécanisme peut-être répété. On obtient, en sortie de décodeur, des embeddings de dimension `model_dimension`.

### Projection dans le vocabulaire

En sortie du décodeur, on obtient un tenseur de taille `(batch, sequence_length, model_dimension)`. On applique alors une couche linéaire suivie d’une softmax pour transformer chaque embedding en distribution de probabilité sur le vocabulaire :

$$
\text{logits} = \text{final\_output} \cdot W^{\text{vocab}} + b^{\text{vocab}} \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times |\mathcal{V}|}
$$

$$
\text{probas} = \text{softmax}(\text{logits}) \in \mathbb{R}^{\text{sequence\_length}_{\text{dec}} \times |\mathcal{V}|}
$$

où :

- $W^{\text{vocab}} \in \mathbb{R}^{d_{\text{model}} \times |\mathcal{V}|}$
- $b^{\text{vocab}} \in \mathbb{R}^{|\mathcal{V}|}$
- $|\mathcal{V}|$ est la taille du vocabulaire.

Donnant un tenseur de taille `(batch_size, sequence_length_dec, vocab_size)` .