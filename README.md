# dylan-lebreton.github.io

Mon wiki personnel : https://dylan-lebreton.github.io

Généré par [Quartz v4](https://quartz.jzhao.xyz/) à partir des markdown de `content/`.

## Workflow

1. Éditer/ajouter des `.md` dans `content/` (liens `[[page]]`, transclusion `![[page]]`).
2. Prévisualiser en local si besoin :
   ```bash
   npm ci                    # première fois seulement
   npx quartz build --serve  # http://localhost:8080, rechargement à chaud
   ```
3. `git commit` + `git push` → GitHub Actions reconstruit et déploie le site automatiquement.
