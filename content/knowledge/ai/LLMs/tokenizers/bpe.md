---
title: Byte-pair encoding (BPE)
rank: 2
tags:
  - AI
  - Python
  - Tokenizer
---

## Vanilla BPE

Consider the following sentence:

> low low low low low lower lower newest newest newest newest newest newest widest widest widest
> 

We split the words on whitespace and append a suffix (for example "_") to tell the words
apart:

> low_ low_ low_ low_ low_ lower_ lower_ newest_ newest_ newest_ newest_ newest_ newest_ widest_ widest_ widest_
> 

We count the frequencies:

```python
(low_: 5, lower_: 2, newest_: 6, widest_: 3)
```

We build a vocabulary from all of the available characters:

```python
vocabs = (l, o, w, e, r, n, s, t, i, d, _)
```

We represent each word as a combination of the vocabulary items:

```bash
[('l','o','w','_'), ('l','o','w','e','r','_'), ('n','e','w','e','s','t','_'), ('w','i','d','e','s','t','_')]
```

For each word, we count how many times each pair of adjacent symbols occurs, in reading
order. For example, for the word `('l','o','w','_')`:

```bash
('lo': 1, 'ow': 1, 'w_': 1)
```

We then get the frequency of these pairs across the whole corpus by multiplying by the
word frequencies.

```bash
[(l,o): 7, (o,w): 7, (w,_): 5, ...]

```

We select the most frequent pair `(e, s)` and merge it to create a new vocabulary item:

```python
vocabs = (l, o, w, e, r, n, s, t, i, d, _, es)
```

We represent each word again as a combination of the vocabulary items:

```bash
[('l','o','w','_'), ('l','o','w','e','r','_'), ('n','e','w','es','t','_'), ('w','i','d','es','t','_')]
```

We recount the frequency of each adjacent pair:

```bash
((l,o): 7, (o,w): 7, (w,_): 5, (w,es): 9, ...)
```

We take the most frequent pair again to merge it and add it to the vocabulary, and so on.

We stop the algorithm according to several possible stopping criteria:

- The vocabulary size reaches a maximum
- The number of merges reaches a maximum (equivalent to the previous criterion minus the initial number of symbols)
- No pair is frequent enough anymore
- There are no more pairs to merge

For inference, we then have:

- A vocabulary
- A set of merge rules

We simply reapply the merges to assign each input element the token obtained from the
vocabulary. If a token does not exist, we can use tags such as `[UNK]`.

## Byte-level BPE

In UTF-8, each character is a sequence of bytes:

`a` → 97, `ø` → 195 184, `🐍` → 240 159 144 141.

So we start from an initial vocabulary containing the 256 possible bytes, along with
special tokens added by hand such as `<|endoftext|>`.

We reapply the vanilla algorithm on this representation.
