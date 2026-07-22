---
title: Décomposition en valeurs singulières (SVD)
tags:
  - algèbre-linéaire
---

Toute matrice $A \in \mathbb{R}^{m \times n}$ se factorise en $A = U \Sigma V^\top$ avec
$U$, $V$ orthogonales et $\Sigma$ diagonale positive.

C'est l'outil derrière la PCA, les systèmes de recommandation, la compression d'images,
et une bonne intuition pour les projections dans [[attention|l'attention des Transformers]].

```python
import numpy as np

U, s, Vt = np.linalg.svd(A, full_matrices=False)
A_rank_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k]  # meilleure approximation de rang k
```
