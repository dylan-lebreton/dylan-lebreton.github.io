---
title: WordPiece
rank: 1
tags:
  - IA
  - Python
  - Tokenizer
---

Soit la phrase suivante :

> the quick brown fox jumps over the lazy dog
> 

On découpe les mots selon les espaces, puis on représente chaque mot caractère par caractère, en ajoutant le préfixe `##` à tous les caractères après le premier :

> `t ##h ##e q ##u ##i ##c ##k b ##r ##o ##w ##n f ##o ##x j ##u ##m ##p ##s o ##v ##e ##r t ##h ##e l ##a ##z ##y d ##o ##g`
> 

On compte la fréquence des mots :

```python
(the: 2, quick: 1, brown: 1, fox: 1, jumps: 1, over: 1, lazy: 1, dog: 1)
```

On crée un vocabulaire initial basé sur tous les caractères observés, et leur forme préfixée `##`. On y ajoute aussi des tokens spéciaux comme `[UNK]` 

```python
vocabs = (t, ##h, ##e, q, ##u, ##i, ##c, ##k, b, ##r, ##o, ##w, ##n,
          f, ##x, j, ##m, ##p, ##s, o, ##v, l, ##a, ##z, ##y, d, ##g, [UNK])
```

On représente chaque mot par une combinaison des éléments du vocabulaire :

```bash
[('t','##h','##e'), ('q','##u','##i','##c','##k'), ...]
```

Pour chaque mot, on précompte toutes les sous-chaînes contiguës possibles, en deux versions :

– sans préfixe (`t`, `th`, `the`, …) si la sous-chaîne peut apparaître en début de mot,

– avec `##` (`##h`, `##he`, `##e`, …) si elle est interne au mot.

On multiplie par la fréquence du mot.

Exemple partiel :

```bash
t: 2, th: 2, the: 2, ##h: 2, ##he: 2, ##e: 2,
q: 1, qu: 1, qui: 1, quic: 1, quick: 1,
...
```

WordPiece choisit la paire `(u, v)` qui maximise le score suivant :

$$
\text{score}(u, v) = \frac{\mathrm{freq}(uv) \times |\mathcal{V}|}{\mathrm{freq}(u) \times \mathrm{freq}(v)}
$$

Ce score favorise les paires fréquentes mais surtout spécifiques.

On multiplie par la taille du vocabulaire $|\mathcal{V}|$ car :

- Ça ne change pas la comparaison entre les paires pour un tour donné
- Mais ça permet d’augmenter le score d’une paire non fusionnée entre deux tours
- Permet d’éviter l’arrêt de l’algorithme avec un petit vocabulaire si critère d’arrêt sur score

On sélectionne la meilleure paire (par exemple `(t, ##h)`), qu’on fusionne pour créer un nouveau token. On supprime n’importe quel `##` interne.

```python
vocabs = (..., th)
```

On représente de nouveau les mots en remplaçant les paires fusionnées :

```bash
[('th','##e'), ('q','##u','##i','##c','##k'), ...]
```

Attention, on fait bien la distinction entre les paires qui débutent un mot ou non. Aussi, comme on a ajouté `th` au vocabulaire, on ne transforme pas les `##t##h` en `th` . Mais on l’aurait fait si on avait ajouté `##th` au vocabulaire.

On recompte les sous-chaînes contiguës (y compris celles contenant les nouveaux tokens) :

```bash
th: 2, the: 2, ##he: 2, (th,##e): 2, ...
```

On reprend la sous-chaîne la plus fréquente ou la mieux scorée (ex. `##he`), on l’ajoute au vocabulaire et on continue le processus.

On arrête l’algorithme selon plusieurs critères possibles :

- La taille du vocabulaire atteint un maximum
- Le score de la meilleure paire passe sous un seuil
- Il n’y a plus de sous-chaînes à fusionner

Pour l’inférence, on obtient :

- Un vocabulaire final (souvent un simple fichier `vocab.txt`)
- Un algorithme de greedy matching : on cherche la plus longue sous-séquence possible dans le vocabulaire à partir du début du mot. Si aucune correspondance n’est trouvée, on utilise `[UNK]`.

Exemple :

```bash
quickness → ['quick', '##n', '##e', '##s', '##s']
```