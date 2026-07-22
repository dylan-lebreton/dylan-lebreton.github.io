---
title: Cargo
tags:
  - rust
---

## Compilation et exécution

Pour compiler :

```bash
cargo build
```

Pour compiler et exécuter :

```bash
cargo run
```

Pour checker la compilation (sans compiler) :

```bash
cargo check
```

Pour compiler avec optimisations :

```bash
cargo build --release
```

Pour compiler et exécuter avec optimisations :

```bash
cargo run --release
```

## Dépendances

Ajouter une "crate" (caisse), c'est-à-dire une librairie :

```bash
cargo add rand
```

Les librairies sont ajoutées au `Cargo.toml`, et tout est spécifié dans le `Cargo.lock`.
Pour update les librairies manuellement :

```bash
cargo update
```

Pour générer la doc de toutes les dépendances du projet :

```bash
cargo doc --open
```
