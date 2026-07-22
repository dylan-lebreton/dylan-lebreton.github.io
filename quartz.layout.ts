import fs from "fs"
import path from "path"
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"

// Ordre manuel des pages : clé `rank` dans le front-matter (plus petit = plus haut).
// Une page sans `rank` reste triée alphabétiquement, après les pages classées.
// Un dossier se classe via le `rank` du front-matter de son index.md.
//
// L'explorateur (arbre de gauche) est construit dans le navigateur à partir d'un
// index qui ne contient pas les front-matters. On scanne donc content/ ici, au
// chargement de la config, pour fabriquer la table slug → rank et l'incruster dans
// la fonction de tri envoyée au navigateur. Conséquence en prévisualisation locale :
// un changement de `rank` ne se voit dans l'arbre de gauche qu'après relance de
// ./preview.sh (en production, chaque push rebuilde tout, donc toujours à jour).
function collectRanks(
  dir: string,
  prefix: string,
  ranks: Record<string, number>,
): Record<string, number> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      collectRanks(path.join(dir, entry.name), `${prefix}${entry.name}/`, ranks)
    } else if (entry.name.endsWith(".md")) {
      const source = fs.readFileSync(path.join(dir, entry.name), "utf8")
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      const rank = frontmatter?.[1].match(/^rank:\s*(-?\d+(?:\.\d+)?)\s*$/m)
      if (rank) {
        // les fichiers étant en kebab-case sans accents, le slug est le chemin sans `.md`
        ranks[`${prefix}${entry.name.slice(0, -3)}`] = Number(rank[1])
      }
    }
  }
  return ranks
}

// `new Function` plutôt qu'une fonction littérale : Quartz sérialise ce tri avec
// `.toString()` pour l'exécuter dans le navigateur, toute variable extérieure serait
// perdue. Ici la table est incrustée dans le code source même de la fonction.
const explorerSortFn = new Function(
  "a",
  "b",
  `const rank = ${JSON.stringify(collectRanks("content", "", {}))};
  const ra = rank[a.slug] ?? Number.MAX_SAFE_INTEGER;
  const rb = rank[b.slug] ?? Number.MAX_SAFE_INTEGER;
  if (ra !== rb) return ra - rb;
  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
  return a.displayName.localeCompare(b.displayName, undefined, {
    numeric: true,
    sensitivity: "base",
  });`,
) as (a: FileTrieNode, b: FileTrieNode) => number

const explorer = Component.Explorer({ sortFn: explorerSortFn })

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/dylan-lebreton",
      LinkedIn: "https://www.linkedin.com/in/dylan-lebreton/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    explorer,
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    explorer,
  ],
  right: [],
}
