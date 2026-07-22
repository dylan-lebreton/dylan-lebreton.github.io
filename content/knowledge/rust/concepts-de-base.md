---
title: Concepts de base
tags:
  - rust
---

Pour tout ce qui touche à la compilation et aux dépendances, voir [[cargo|Cargo]].

## Variables

Définition d'une variable :

```rust
let x: int = 10;
```

Définition d'une variable mutable :

```rust
let mut x: int = 10;

x = 6;
```

Définition d'une constante (obligatoire, on peut pas juste déclarer) :

```rust
const THREE_HOURS_IN_SECONDS: u32; // erreur de compilation
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

Une variable mutable ne peut changer que de valeur, pas de type.

Pour modifier le type d'une variable, on doit utiliser le shadowing :

```rust
let age = "42";         // String

let age: u32 = age.parse().unwrap(); // u32 — même nom, type différent !
```

## Types de données

### Entiers

| Longueur | Signé | Non signé | Intervalle signé | Intervalle non signé |
| --- | --- | --- | --- | --- |
| 8-bit | `i8` | `u8` | [-128, 127] | [0, 255] |
| 16-bit | `i16` | `u16` | [-32 768, 32 767] | [0, 65 535] |
| 32-bit | `i32` | `u32` | [-2 147 483 648, 2 147 483 647] | [0, 4 294 967 295] |
| 64-bit | `i64` | `u64` | [-9 223 372 036 854 775 808, 9 223 372 036 854 775 807] | [0, 18 446 744 073 709 551 615] |
| 128-bit | `i128` | `u128` | [-170 141 183 460 469 231 731 687 303 715 884 105 728, 170 141 183 460 469 231 731 687 303 715 884 105 727] | [0, 340 282 366 920 938 463 463 374 607 431 768 211 455] |
| Architecture | `isize` | `usize` | [même que i64 sur 64-bit] | [même que u64 sur 64-bit] |

`usize` et `isize` s'adaptent au CPU pour toujours pouvoir indexer la plus grande
collection possible sur la machine — sur un MacBook 64-bit, `usize` va jusqu'à
18 446 744 073 709 551 615.

```rust
let v = vec![10, 20, 30];

let i: usize = 2;

println!("{}", v[i]); // 30
```

Les literals permettent d'écrire un même nombre de plusieurs façons selon la base souhaitée.

```rust
let a = 65;          // décimal      = 65

let b = 0x41;        // hexadécimal  = 65

let c = 0o101;       // octal        = 65

let d = 0b0100_0001; // binaire      = 65

let e = b'A';        // byte ASCII   = 65
```

Un **integer overflow** survient quand une valeur dépasse la capacité du type (ex. 256
dans un `u8` max 255). En debug → **panic**. En release → *wrapping* silencieux
(256 → 0, 257 → 1…).

Quatre méthodes pour gérer l'overflow explicitement :

```rust
let x: u8 = 250;

x.wrapping_add(10)     // 4 (boucle)

x.checked_add(10)      // None si overflow

x.overflowing_add(10)  // (4, true)

x.saturating_add(10)   // 255 (plafonne)
```

### Flottants

`f32` (32-bit) et `f64` (64-bit, par défaut). Standard IEEE-754. Toujours signés.

### Opérations numériques

`+`, `-`, `*`, `/`, `%` — la division entière tronque vers zéro : `7 / 3 == 2`, `-7 / 3 == -2`.

### Booléens

`bool` : `true` / `false`, 1 octet.

### Caractères

`char` : 4 octets, Unicode scalar (`'z'`, `'ℤ'`, `'😻'`). Simple quotes (vs `"` pour les strings).

### Tuples

Taille fixe, types hétérogènes. Accès par destructuring ou par index (`.0`, `.1`…).

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);

let (x, y, z) = tup;       // destructuring

let first = tup.0;          // accès par index
```

Le tuple vide `()` s'appelle **unit** — valeur de retour implicite quand une fonction ne
retourne rien. Pour une valeur potentiellement absente, Rust utilise `Option<T>` (pas de
`null` en Rust).

### Arrays

Taille fixe, type homogène, alloué sur la **stack**. Pour une taille variable → utiliser `Vec`.

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];

let zeros = [0; 5];         // [0, 0, 0, 0, 0]

let first = a[0];
```

Un accès hors limites provoque un **panic** à l'exécution (pas d'accès mémoire invalide
comme en C).

### Fonctions

Déclarées avec `fn`, convention **snake_case**. Les types des paramètres sont obligatoires.

```rust
fn add(a: i32, b: i32) -> i32 {

	a + b   // pas de ; → expression retournée implicitement

}
```

Distinction importante en Rust : **statement** vs **expression**.

- **Statement** : effectue une action, ne retourne rien (`let x = 5;`).
- **Expression** : produit une valeur (`5 + 3`, un bloc `{…}`, un appel de fonction…).

Un bloc `{}` est une expression — sa dernière ligne sans `;` est sa valeur :

```rust
let y = {

	let x = 3;

	x + 1       // pas de ; → le bloc vaut 4

};
```

Ajouter un `;` à la fin transforme l'expression en statement → retourne `()` au lieu de
la valeur. Piège classique :

```rust
fn add(a: i32, b: i32) -> i32 {

	a + b;  // ← ; en trop → erreur de compilation

}
```

### Conditions `if`

```rust
if number % 4 == 0 {
	println!("number is divisible by 4");
} else if number % 3 == 0 {
	println!("number is divisible by 3");
} else {
	println!("number is not divisible by 4, or 3");
}
```

Comme `if` est une expression, on peut l'utiliser comme résultat d'un `let` :

```rust
let condition = true;
let number = if condition { 5 } else { 6 };
```

### Autre

Pour générer un range (inclusif à gauche et à droite) :

```rust
start..=end
```
