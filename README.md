# dylan-lebreton.github.io

Wiki personnel de Dylan Lebreton : https://dylan-lebreton.github.io

Site généré par [Quartz v4](https://quartz.jzhao.xyz/) à partir des fichiers markdown de
`content/`. Le build et le déploiement se font automatiquement dans GitHub Actions à chaque
push sur `main`. Le flux de travail se résume donc à trois étapes : éditer du markdown,
committer, pousser. Le site est à jour environ une minute trente après le push.

Prévisualisation locale (optionnelle) :

```bash
npm ci                    # première fois seulement
npx quartz build --serve  # http://localhost:8080, rechargement à chaud
```

## Comment écrire une page

Une page correspond à un fichier `.md` dans `content/`, et un sous-dossier devient une
section dans l'explorateur (l'imbrication est illimitée). Les fichiers sont nommés en
`kebab-case` (par exemple `concepts-de-base.md`), sans accents ni espaces. `content/index.md`
est la page d'accueil et ne doit pas être supprimée. Un `index.md` placé dans un dossier
personnalise la page de la section ; en son absence, Quartz génère une simple liste.

### Le front-matter (l'en-tête entre `---`)

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
  liens. **Il remplace le `# Titre`** qu'on mettrait d'habitude, puisque Quartz l'affiche
  déjà en H1. Le corps de la page démarre donc directement aux `##`, sans `#`. En l'absence
  de `title`, Quartz reprend le nom du fichier.
- `tags` : facultatif. Chaque tag dispose d'une page auto-générée qui liste ses notes.
- `draft: true` : facultatif. La page est buildée en local mais n'est pas publiée.

### Titres

`##` pour les sections, `###` et `####` pour les sous-sections. Le sommaire à droite de
chaque page se construit tout seul à partir de ces titres.

### Liens entre pages

- `[[cargo]]` : lien vers la page, le nom de fichier suffit s'il est unique.
- `[[cargo|libellé]]` : lien avec un autre texte.
- `[[knowledge/rust/cargo]]` : chemin complet si le nom est ambigu.
- `[[knowledge/rust/|Rust]]` : lien vers un dossier (avec le `/` final).
- `[[cargo#Dépendances]]` : lien vers une section précise.
- Un lien vers une page inexistante n'empêche pas le build ; il reste mort jusqu'à la
  création de la page.
- Lien externe : markdown classique `[texte](https://…)`.

### Transclusion (inclure une page dans une autre)

- `![[cargo]]` : insère tout le contenu de la page.
- `![[cargo#Dépendances]]` : insère uniquement cette section.

### Images et fichiers

Le fichier est déposé dans `content/` (par exemple à côté de la page), puis appelé avec
`![[schema.png]]`.

### Mise en forme

- Code : blocs ` ```rust ` / ` ```python ` / ` ```bash ` avec coloration automatique, et
  `inline` avec les backticks.
- Maths KaTeX : `$e^{i\pi}$` en ligne, `$$ … $$` en bloc.
- Callouts : `> [!note]`, `> [!tip]`, `> [!warning]`, `> [!example]`, repliables avec la
  variante `> [!note]-`.
- Tableaux, listes, citations, gras et italique : markdown standard (GFM).
