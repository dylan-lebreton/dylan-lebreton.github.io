---
title: Le mécanisme d'attention
tags:
  - deep-learning
  - transformers
---

L'attention calcule, pour chaque token, une moyenne pondérée des autres tokens :

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

Le facteur $\sqrt{d_k}$ évite que les produits scalaires n'écrasent le softmax quand la
dimension grandit.

> [!note] Lien avec le reste du wiki
> La décomposition [[svd|SVD]] aide à comprendre ce que « projeter dans un sous-espace »
> veut dire pour les matrices $Q$, $K$ et $V$.
