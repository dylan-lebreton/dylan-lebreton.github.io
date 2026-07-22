---
title: Métriques de classification
---

Comment mesurer qu'un classifieur est bon — et surtout, comment ne pas se mentir.

- [[courbe-roc|Courbe ROC]] — le grand classique, seuil par seuil.
- [[precision-recall|Courbe Precision-Recall]] — indispensable dès que les classes sont déséquilibrées.

## Rappels express

La matrice de confusion donne quatre quantités (TP, FP, TN, FN) dont dérivent toutes les
métriques : $\text{précision} = \frac{TP}{TP+FP}$, $\text{rappel} = \frac{TP}{TP+FN}$.
