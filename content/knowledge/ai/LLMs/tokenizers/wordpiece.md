---
title: WordPiece
rank: 1
tags:
  - AI
  - Python
  - Tokenizer
---

Consider the following sentence:

> the quick brown fox jumps over the lazy dog
> 

We split the words on whitespace, then represent each word character by character, adding
the `##` prefix to every character after the first:

> `t ##h ##e q ##u ##i ##c ##k b ##r ##o ##w ##n f ##o ##x j ##u ##m ##p ##s o ##v ##e ##r t ##h ##e l ##a ##z ##y d ##o ##g`
> 

We count the word frequencies:

```python
(the: 2, quick: 1, brown: 1, fox: 1, jumps: 1, over: 1, lazy: 1, dog: 1)
```

We create an initial vocabulary from all of the observed characters and their prefixed
`##` form. We also add special tokens such as `[UNK]`.

```python
vocabs = (t, ##h, ##e, q, ##u, ##i, ##c, ##k, b, ##r, ##o, ##w, ##n,
          f, ##x, j, ##m, ##p, ##s, o, ##v, l, ##a, ##z, ##y, d, ##g, [UNK])
```

We represent each word as a combination of the vocabulary items:

```bash
[('t','##h','##e'), ('q','##u','##i','##c','##k'), ...]
```

For each word, we precompute all of the possible contiguous substrings, in two versions:

- without a prefix (`t`, `th`, `the`, …) if the substring can appear at the start of a word,
- with `##` (`##h`, `##he`, `##e`, …) if it is internal to the word.

We multiply by the word frequency.

Partial example:

```bash
t: 2, th: 2, the: 2, ##h: 2, ##he: 2, ##e: 2,
q: 1, qu: 1, qui: 1, quic: 1, quick: 1,
...
```

WordPiece chooses the pair `(u, v)` that maximises the following score:

$$
\text{score}(u, v) = \frac{\mathrm{freq}(uv) \times |\mathcal{V}|}{\mathrm{freq}(u) \times \mathrm{freq}(v)}
$$

This score favours pairs that are frequent but, above all, specific.

We multiply by the vocabulary size $|\mathcal{V}|$ because:

- It does not change the comparison between pairs within a given round
- But it lets the score of an unmerged pair grow between two rounds
- It avoids stopping the algorithm with a small vocabulary when the stopping criterion is based on the score

We select the best pair (for example `(t, ##h)`) and merge it to create a new token. We
drop any internal `##`.

```python
vocabs = (..., th)
```

We represent the words again, replacing the merged pairs:

```bash
[('th','##e'), ('q','##u','##i','##c','##k'), ...]
```

Note that we do distinguish between pairs that start a word and those that do not. Also,
since we added `th` to the vocabulary, we do not turn `##t##h` into `th`. We would have
done so, however, had we added `##th` to the vocabulary.

We recount the contiguous substrings (including those containing the new tokens):

```bash
th: 2, the: 2, ##he: 2, (th,##e): 2, ...
```

We take the most frequent or best-scoring substring again (for example `##he`), add it to
the vocabulary and continue the process.

We stop the algorithm according to several possible criteria:

- The vocabulary size reaches a maximum
- The score of the best pair drops below a threshold
- There are no more substrings to merge

For inference, we have:

- A final vocabulary (often just a `vocab.txt` file)
- A greedy matching algorithm: we look for the longest possible subsequence in the vocabulary, starting from the beginning of the word. If no match is found, we use `[UNK]`.

Example:

```bash
quickness → ['quick', '##n', '##e', '##s', '##s']
```
