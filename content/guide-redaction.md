---
title: Guide de rédaction
---

Mémo : comment écrire une page de ce wiki. Une page = un fichier `.md` dans `content/`,
un sous-dossier = une section dans l'explorateur (imbrication illimitée). Nommer les
fichiers en `kebab-case` (`concepts-de-base.md`), sans accents ni espaces.

## Le front-matter (l'en-tête entre `---`)

Chaque page commence par un petit bloc YAML :

```yaml
---
title: Concepts de base
tags:
  - rust
draft: true
---
```

- `title` : le titre affiché en haut de la page, dans l'explorateur, la recherche et les
  liens. **C'est lui qui remplace le `# Titre`** qu'on mettrait d'habitude : Quartz
  l'affiche déjà en H1, donc pas de `#` dans le corps — on démarre directement aux `##`.
  Sans `title`, Quartz prend le nom du fichier.
- `tags` : optionnel — chaque tag a une page auto-générée qui liste ses notes.
- `draft: true` : optionnel — la page est buildée en local mais **pas publiée**.

## Titres

`##` pour les sections, `###`/`####` pour les sous-sections. Le sommaire à droite se
construit tout seul à partir de ces titres.

## Liens entre pages

- `[[cargo]]` → lien vers la page, le nom de fichier suffit s'il est unique.
- `[[cargo|libellé]]` → lien avec un autre texte.
- `[[knowledge/rust/cargo]]` → chemin complet si le nom est ambigu.
- `[[knowledge/rust/|Rust]]` → lien vers un dossier (le `/` final).
- `[[cargo#Dépendances]]` → lien vers une section précise.
- Lien vers une page qui n'existe pas encore : le build passe, le lien restera mort
  jusqu'à ce que tu crées la page.
- Lien externe : markdown classique `[texte](https://…)`.

## Transclusion (inclure une page dans une autre)

- `![[cargo]]` → insère tout le contenu de la page.
- `![[cargo#Dépendances]]` → insère uniquement cette section.

## Images et fichiers

Poser le fichier dans `content/` (par ex. à côté de la page) puis `![[schema.png]]`.

## Mise en forme

- Code : blocs ` ```rust ` / ` ```python ` / ` ```bash `… (coloration auto), `inline` avec les backticks.
- Maths KaTeX : `$e^{i\pi}$` en ligne, `$$ … $$` en bloc.
- Callouts : `> [!note]`, `> [!tip]`, `> [!warning]`, `> [!example]`… — repliables avec `> [!note]-`.
- Tableaux, listes, citations, gras/italique : markdown standard (GFM).

## Publier

```bash
npx quartz build --serve   # préviz locale http://localhost:8080 (optionnel)
```

Puis `git commit` + `git push` : GitHub Actions reconstruit et déploie le site (~1 min 30).
