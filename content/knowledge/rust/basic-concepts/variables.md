---
title: Variables
rank: 1
tags:
  - rust
---

Declaring a variable:

```rust
let x: i32 = 10;
```

Declaring a mutable variable:

```rust
let mut x: i32 = 10;

x = 6;
```

Declaring a constant (it must always be initialised at declaration):

```rust
const THREE_HOURS_IN_SECONDS: u32; // compile error
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

A mutable variable can only change its value, not its type.

To change the type of a variable, you have to use shadowing:

```rust
let age = "42";         // &str

let age: u32 = age.parse().unwrap(); // u32, same name, different type!
```
