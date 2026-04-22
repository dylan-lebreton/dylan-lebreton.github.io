# Hello World

Bienvenue dans la section **Knowledge** du site. C'est ici que je publie des notes,
des résumés et des articles techniques que j'écris au fil des projets.

## Pourquoi cette section ?

Plutôt que de laisser mes notes dormir dans Notion, je les publie ici quand elles
peuvent être utiles à d'autres — ou à mon moi futur.

> Writing is thinking. To write well is to think clearly. That's why it's so hard.
> — *David McCullough*

## Comment ça marche ?

Chaque article est un simple fichier Markdown. Le site le rend côté client avec
[marked](https://marked.js.org/) et la coloration syntaxique via
[highlight.js](https://highlightjs.org/).

Quelques points :

- Pas de build, pas de framework — juste du HTML, du CSS et un peu de JS.
- Les articles vivent dans `knowledge/articles/*.md`.
- Un manifest `knowledge/articles.json` définit l'ordre, la date, le résumé et les tags.

## Un peu de code

```python
import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """Softmax stable numériquement."""
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=-1, keepdims=True)

print(softmax(np.array([2.0, 1.0, 0.1])))
```

Et en inline, par exemple `f(x) = e^x / Σ e^x`.

## Listes imbriquées

1. Première étape
   - sous-point A
   - sous-point B
2. Deuxième étape
3. Troisième étape

---

À bientôt pour le prochain article.
