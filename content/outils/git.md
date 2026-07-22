---
title: Git
tags:
  - outils
---

## Antisèche

```bash
git log --oneline --graph --all   # vue d'ensemble
git add -p                        # stage par morceaux
git restore --staged fichier      # dé-stager sans perdre
git rebase -i HEAD~3              # réécrire les 3 derniers commits
```

> [!tip] Convention de commits
> Ce dépôt suit les [Conventional Commits](https://www.conventionalcommits.org/fr/) :
> `type(scope): message` — par exemple `feat(content): add SVD note`.
