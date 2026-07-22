import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Dylan Lebreton",
    pageTitleSuffix: " — Dylan Lebreton",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "fr-FR",
    baseUrl: "dylan-lebreton.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      // Liste des pages d'une section : même règle que l'explorateur (quartz.layout.ts).
      // `rank` du front-matter d'abord (plus petit = plus haut), puis dossiers avant
      // pages, puis ordre alphabétique des titres.
      Plugin.FolderPage({
        sort: (a, b) => {
          const rankOf = (file: typeof a) => {
            const raw = (file.frontmatter as Record<string, unknown> | undefined)?.rank
            const value = typeof raw === "number" || typeof raw === "string" ? Number(raw) : NaN
            return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
          }
          if (rankOf(a) !== rankOf(b)) {
            return rankOf(a) - rankOf(b)
          }
          const aIsFolder = (a.slug ?? "").endsWith("/index")
          const bIsFolder = (b.slug ?? "").endsWith("/index")
          if (aIsFolder !== bIsFolder) {
            return aIsFolder ? -1 : 1
          }
          return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "", undefined, {
            numeric: true,
            sensitivity: "base",
          })
        },
      }),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
