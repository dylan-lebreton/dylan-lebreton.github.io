# dylan-lebreton.github.io

Mon wiki personnel : https://dylan-lebreton.github.io

Généré par [Quartz v4](https://quartz.jzhao.xyz/) à partir des markdown de `content/`.
Le build et le déploiement se font automatiquement dans GitHub Actions à chaque push sur
`main` : **éditer du markdown → commit → push, c'est tout** (~1 min 30 pour voir le site à jour).

Prévisualisation locale (optionnelle) :

```bash
npm ci                    # première fois seulement
npx quartz build --serve  # http://localhost:8080, rechargement à chaud
```

## Comment écrire une page

Une page = un fichier `.md` dans `content/`, un sous-dossier = une section dans
l'explorateur (imbrication illimitée). Nommer les fichiers en `kebab-case`
(`concepts-de-base.md`), sans accents ni espaces. `content/index.md` est la page
d'accueil (à ne pas supprimer) ; un `index.md` dans un dossier personnalise la page de
la section (sinon Quartz génère une simple liste).

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
  liens. **C'est lui qui remplace le `# Titre`** qu'on mettrait d'habitude : Quartz
  l'affiche déjà en H1, donc pas de `#` dans le corps — on démarre directement aux `##`.
  Sans `title`, Quartz prend le nom du fichier.
- `tags` : optionnel — chaque tag a une page auto-générée qui liste ses notes.
- `draft: true` : optionnel — la page est buildée en local mais **pas publiée**.

### Titres

`##` pour les sections, `###`/`####` pour les sous-sections. Le sommaire à droite de
chaque page se construit tout seul à partir de ces titres.

### Liens entre pages

- `[[cargo]]` → lien vers la page, le nom de fichier suffit s'il est unique.
- `[[cargo|libellé]]` → lien avec un autre texte.
- `[[knowledge/rust/cargo]]` → chemin complet si le nom est ambigu.
- `[[knowledge/rust/|Rust]]` → lien vers un dossier (avec le `/` final).
- `[[cargo#Dépendances]]` → lien vers une section précise.
- Lien vers une page qui n'existe pas encore : le build passe, le lien restera mort
  jusqu'à ce que la page soit créée.
- Lien externe : markdown classique `[texte](https://…)`.

### Transclusion (inclure une page dans une autre)

- `![[cargo]]` → insère tout le contenu de la page.
- `![[cargo#Dépendances]]` → insère uniquement cette section.

### Images et fichiers

Poser le fichier dans `content/` (par ex. à côté de la page) puis `![[schema.png]]`.

### Mise en forme

- Code : blocs ` ```rust ` / ` ```python ` / ` ```bash `… (coloration auto), `inline` avec les backticks.
- Maths KaTeX : `$e^{i\pi}$` en ligne, `$$ … $$` en bloc.
- Callouts : `> [!note]`, `> [!tip]`, `> [!warning]`, `> [!example]`… — repliables avec `> [!note]-`.
- Tableaux, listes, citations, gras/italique : markdown standard (GFM).
