---
title: Environnements virtuels
tags:
  - outils
  - python
---

Un projet = un environnement. Sans exception.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Alternatives modernes : `uv` (très rapide), `poetry` (lockfile et packaging), `conda`
(quand il faut des binaires scientifiques).
