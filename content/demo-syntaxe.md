---
title: Démo de syntaxe
tags:
  - démo
---

Tout ce que ce wiki sait afficher, sur une seule page.

## Liens entre pages

- Lien wiki simple : [[courbe-roc]]
- Lien avec libellé : [[theoreme-bayes|le théorème de Bayes]]
- Lien vers un dossier : [[machine-learning/|la section Machine Learning]]
- Survole un lien interne : un **aperçu de la page** apparaît (popover).

## Transclusion — inclure une autre page

Le bloc ci-dessous n'est pas écrit ici : c'est la page [[precision-recall]] **incluse**
avec la syntaxe `![[precision-recall]]` :

![[precision-recall]]

## Blocs de code

```python
def entropie(p: list[float]) -> float:
    """Entropie de Shannon en bits."""
    return -sum(x * log2(x) for x in p if x > 0)
```

## Callouts

> [!note] Note repliable
> Les callouts façon Obsidian fonctionnent : note, tip, warning, example…

## Maths

Inline $e^{i\pi} + 1 = 0$, et en bloc :

$$
\hat{\theta} = \arg\max_\theta \; \sum_{i=1}^n \log p_\theta(x_i)
$$

## Tableaux

| Métrique | Classes équilibrées | Classes déséquilibrées |
| --- | :-: | :-: |
| Accuracy | ✅ | ❌ |
| AUC ROC | ✅ | ⚠️ |
| AUC PR | ✅ | ✅ |
