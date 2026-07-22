---
title: Régression logistique
tags:
  - classification
  - modèles
---

Modèle linéaire de classification binaire : on modélise $\mathbb{P}(Y=1 \mid X=x) = \sigma(w^\top x + b)$
avec $\sigma(z) = \frac{1}{1+e^{-z}}$.

## Implémentation minimale

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, random_state=42)
clf = LogisticRegression(max_iter=1000, class_weight="balanced")
clf.fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]
```

> [!tip] Déséquilibre des classes
> Avec `class_weight="balanced"`, ne jugez pas le modèle à l'accuracy : préférez la
> [[precision-recall|courbe Precision-Recall]] ou la [[courbe-roc|courbe ROC]].

## Points d'attention

| Sujet | À retenir |
| --- | --- |
| Régularisation | `C` est l'**inverse** de la force de régularisation |
| Features | Standardiser avant d'interpréter les coefficients |
| Seuil | 0,5 n'est presque jamais le bon seuil métier |
