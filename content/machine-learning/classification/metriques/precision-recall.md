---
title: Courbe Precision-Recall
tags:
  - métriques
  - évaluation
---

La courbe PR trace la **précision** contre le **rappel** pour tous les seuils. Contrairement
à la [[courbe-roc|ROC]], elle se dégrade visiblement quand la classe positive devient rare :
c'est la métrique honnête des problèmes déséquilibrés (fraude, churn, maladie rare…).

## Baseline

La ligne de base d'un classifieur aléatoire n'est pas 0,5 mais le **taux de positifs** :
avec 2 % de fraudes, un modèle aléatoire a une précision moyenne d'environ 0,02.

```python
from sklearn.metrics import average_precision_score

ap = average_precision_score(y_true, y_score)
```
