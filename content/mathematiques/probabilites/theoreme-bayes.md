---
title: Théorème de Bayes
tags:
  - probabilités
---

$$
\mathbb{P}(A \mid B) = \frac{\mathbb{P}(B \mid A)\,\mathbb{P}(A)}{\mathbb{P}(B)}
$$

Tout l'apprentissage bayésien tient dans cette ligne : le *posterior* est proportionnel à
la vraisemblance fois le *prior*.

> [!example] Exemple classique — test médical
> Maladie à 1 ‰, test sensible à 99 % et spécifique à 95 % : un test positif ne donne
> qu'environ **2 %** de chances d'être malade. L'intuition se trompe parce qu'elle oublie
> le prior — le même mécanisme que la baseline de la [[precision-recall|courbe PR]].
