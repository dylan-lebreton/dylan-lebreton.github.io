---
title: Variables
rank: 1
tags:
  - rust
---

Définition d'une variable :

```rust
let x: i32 = 10;
```

Définition d'une variable mutable :

```rust
let mut x: i32 = 10;

x = 6;
```

Définition d'une constante (elle doit toujours être initialisée à la déclaration) :

```rust
const THREE_HOURS_IN_SECONDS: u32; // erreur de compilation
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

Une variable mutable ne peut changer que de valeur, pas de type.

Pour modifier le type d'une variable, on doit utiliser le shadowing :

```rust
let age = "42";         // &str

let age: u32 = age.parse().unwrap(); // u32, même nom, type différent !
```
