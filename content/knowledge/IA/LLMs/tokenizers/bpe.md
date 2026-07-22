---
title: Byte-pair encoding (BPE)
rank: 2
tags:
  - IA
  - Python
  - Tokenizer
---

## Vanilla BPE

Soit la phrase suivante : 

> low low low low low lower lower newest newest newest newest newest newest widest widest widest
> 

On découpe les mots selon les espaces, on ajoute un suffixe (ex: “_”) pour distinguer les mots :

> low_ low_ low_ low_ low_ lower_ lower_ newest_ newest_ newest_ newest_ newest_ newest_ widest_ widest_ widest_
> 

On compte la fréquence :

```python
(low_: 5, lower_: 2, newest_: 6, widest_: 3)
```

On créer un vocabulaire basé sur tous les caractères disponibles :

```python
vocabs = (l, o, w, e, r, n, s, t, i, d, _)
```

On représente chaque mot par une combinaison des éléments du vocabulaire :

```bash
[('l','o','w','_'), ('l','o','w','e','r','_'), ('n','e','w','e','s','t','_'), ('w','i','d','e','s','t','_')]
```

Pour chaque mot, on calcule le nombre d’occurrences de chaque paire de symboles adjacentes et dans l’ordre de lecture. Par exemple, pour le mot `('l','o','w','_')` :

```bash
('lo': 1, 'ow': 1, 'w_': 1)
```

Et on obtient la fréquence de ces paires dans tout le corpus en multipliant par la fréquence des mots. 

```bash
[(l,o): 7, (o,w): 7, (w,_): 5, ...]

```

On sélectionne la paire la plus fréquente `(e, s)` et on la fusionne pour créer un nouvel élément du vocabulaire :

```python
vocabs = (l, o, w, e, r, n, s, t, i, d, _, es)
```

On représente de nouveau chaque mot par la combinaison des éléments du vocabulaire :

```bash
[('l','o','w','_'), ('l','o','w','e','r','_'), ('n','e','w','es','t','_'), ('w','i','d','es','t','_')]
```

On recompte la fréquence de chaque paire adjacente :

```bash
((l,o): 7, (o,w): 7, (w,_): 5, (w,es): 9, ...)
```

On reprend la paire la plus fréquence pour la fusionner, l’ajouter au vocabulaire, et ainsi de suite.

On arrête l’algorithme selon plusieurs critères d’arrêt possibles :

- La taille du vocabulaire atteint un maximum
- Le nombre de fusion atteint un maximum (équivalent au critère d’avant moins le nombre initial de symboles)
- Plus aucune paire n’est assez fréquente
- Il n’y a plus de paires à fusionner

Pour l’inférence, on obtient alors :

- Un vocabulaire
- Un ensemble de règles de fusion

Il suffit de rappliquer les fusions pour attribuer à chaque élément d’entrée le token obtenu dans le vocabulaire. Si un token n’existe pas, on peut utiliser des balises comme `[UNK]`.

## Byte-level BPE

En UTF-8, chaque caractère est une suite de bytes : 

`a` → 97, `ø` → 195 184, `🐍` → 240 159 144 141.

On part donc d’un vocabulaire initial contenant les 256 bytes possibles, ainsi que des tokens spéciaux ajoutés manuellement comme `<|endoftext|>`.

On ré-applique l’algorithme Vanilla sur cette transformation.