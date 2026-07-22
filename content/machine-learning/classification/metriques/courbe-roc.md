---
title: Courbe ROC
tags:
  - métriques
  - évaluation
---

La courbe ROC trace le **taux de vrais positifs** (TPR) contre le **taux de faux positifs**
(FPR) quand on fait varier le seuil de décision. L'aire sous la courbe (AUC) résume la
capacité du modèle à ordonner les positifs avant les négatifs.

## Lecture

- AUC = 1 : classement parfait.
- AUC = 0,5 : le modèle ne fait pas mieux que le hasard (diagonale).
- La ROC est **insensible au déséquilibre des classes** — c'est sa force et son piège.

> [!warning] Le piège
> Sur un problème à 1 % de positifs, une AUC de 0,95 peut cohabiter avec une précision
> catastrophique. Dans ce cas, regarder la [[precision-recall|courbe Precision-Recall]].

## Calcul

```python
from sklearn.metrics import roc_auc_score, roc_curve

auc = roc_auc_score(y_true, y_score)
fpr, tpr, thresholds = roc_curve(y_true, y_score)
```

Cette page est au **niveau 4** de l'arborescence :
Machine Learning → Classification → Métriques → Courbe ROC.
