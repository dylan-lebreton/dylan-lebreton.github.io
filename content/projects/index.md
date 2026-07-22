---
title: Projects
rank: 1
---

A selection of things I've built. Each card links out to the live project or its source.

> [!abstract] LazyPDF
> An online PDF manipulation tool, free and open to everyone with no sign-up.
>
> **Stack:** React, FastAPI, PostgreSQL, Redis, Docker, Linux, CI/CD.
>
> **Live:** [lazypdf.net](https://lazypdf.net)

> [!abstract] Basket fraud detection: from challenge notebook to MLOps stack
> An end-to-end ML project born from a [BNP Paribas challenge](https://challengedata.ens.fr/challenges/104):
> predicting fraud on retail baskets (1.4% positive class, PR-AUC metric). The XGBoost solution from the
> [exploratory notebook](https://github.com/dylan-lebreton/basket-fraud-detection/blob/main/notebooks/notebook.ipynb)
> was refactored into a Python package and deployed on my own Kubernetes cluster: uploading a training
> CSV to MinIO automatically triggers an Argo training workflow, MLflow versions and promotes the best
> model to `@champion`, and a FastAPI service plus a Streamlit UI serve predictions, with the exact
> same preprocessing pipeline shared between training and inference to avoid skew.
>
> **Stack:** Python, XGBoost, Polars, FastAPI, Streamlit, MLflow, Argo Workflows, MinIO, PostgreSQL, Docker, Kubernetes, GitHub Actions.
>
> **Repo:** [github.com/dylan-lebreton/basket-fraud-detection](https://github.com/dylan-lebreton/basket-fraud-detection)