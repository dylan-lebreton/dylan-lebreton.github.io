---
title: Concepts de base
rank: 2
tags:
  - rust
---

# Variables 

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

# Data Types


## Integers

| Length | Signed | Unsigned | Signed range | Unsigned range |
| --- | --- | --- | --- | --- |
| 8-bit | `i8` | `u8` | [-128, 127] | [0, 255] |
| 16-bit | `i16` | `u16` | [-32,768, 32,767] | [0, 65,535] |
| 32-bit | `i32` | `u32` | [-2,147,483,648, 2,147,483,647] | [0, 4,294,967,295] |
| 64-bit | `i64` | `u64` | [-9,223,372,036,854,775,808, 9,223,372,036,854,775,807] | [0, 18,446,744,073,709,551,615] |
| 128-bit | `i128` | `u128` | [-170,141,183,460,469,231,731,687,303,715,884,105,728, 170,141,183,460,469,231,731,687,303,715,884,105,727] | [0, 340,282,366,920,938,463,463,374,607,431,768,211,455] |
| Architecture | `isize` | `usize` | [same as i64 on 64-bit] | [same as u64 on 64-bit] |

`usize` and `isize` adapt to the CPU so they can always index the largest possible
collection on the machine. On a 64-bit MacBook, `usize` goes up to
18,446,744,073,709,551,615.

```rust
let v = vec![10, 20, 30];

let i: usize = 2;

println!("{}", v[i]); // 30
```

Literals let you write the same number in several ways depending on the base you want.

```rust
let a = 65;          // decimal      = 65

let b = 0x41;        // hexadecimal  = 65

let c = 0o101;       // octal        = 65

let d = 0b0100_0001; // binary       = 65

let e = b'A';        // ASCII byte   = 65
```

An **integer overflow** happens when a value exceeds the capacity of the type (for
example 256 in a `u8`, whose max is 255). In debug it triggers a **panic**. In release it
wraps silently (256 → 0, 257 → 1, and so on).

There are four methods to handle overflow explicitly:

```rust
let x: u8 = 250;

x.wrapping_add(10)     // 4 (wraps around)

x.checked_add(10)      // None on overflow

x.overflowing_add(10)  // (4, true)

x.saturating_add(10)   // 255 (caps out)
```

## Floats

`f32` (32-bit) and `f64` (64-bit, the default). IEEE-754 standard. Always signed.

## Numeric operations

`+`, `-`, `*`, `/`, `%`. Integer division truncates toward zero: `7 / 3 == 2`,
`-7 / 3 == -2`.

## Booleans

`bool`: `true` / `false`, 1 byte.

## Characters

`char`: 4 bytes, a Unicode scalar (`'z'`, `'ℤ'`, `'😻'`). Single quotes (as opposed to
`"` for strings).

## Tuples

Fixed size, heterogeneous types. Accessed through destructuring or by index (`.0`, `.1`,
and so on).

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);

let (x, y, z) = tup;       // destructuring

let first = tup.0;          // access by index
```

The empty tuple `()` is called the **unit**. It is the implicit return value when a
function returns nothing. For a value that may be absent, Rust uses `Option<T>` (there is
no `null` in Rust).

## Arrays

Fixed size, homogeneous type, allocated on the **stack**. For a variable size, use `Vec`.

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];

let zeros = [0; 5];         // [0, 0, 0, 0, 0]

let first = a[0];
```

An out-of-bounds access triggers a **panic** at runtime (no invalid memory access as in
C).

## Ranges

A sequence of values between two bounds. The upper bound is excluded by default, and
included with `=`.

```rust
let exclusive = 1..5;   // 1, 2, 3, 4

let inclusive = 1..=5;  // 1, 2, 3, 4, 5
```

# Functions

Declared with `fn`, following the **snake_case** convention. Parameter types are
mandatory.

```rust
fn add(a: i32, b: i32) -> i32 {

	a + b   // no ; → the expression is returned implicitly

}
```

An important distinction in Rust: **statement** vs **expression**.

- **Statement**: performs an action, returns nothing (`let x = 5;`).
- **Expression**: produces a value (`5 + 3`, a `{…}` block, a function call, and so on).

A `{}` block is an expression, and its last line without a `;` is its value:

```rust
let y = {

	let x = 3;

	x + 1       // no ; → the block evaluates to 4

};
```

Adding a `;` at the end turns the expression into a statement, so it returns `()` instead
of the value. A classic trap:

```rust
fn add(a: i32, b: i32) -> i32 {

	a + b;  // ← extra ; → compile error

}
```

# `if` conditions

```rust
if number % 4 == 0 {
	println!("number is divisible by 4");
} else if number % 3 == 0 {
	println!("number is divisible by 3");
} else {
	println!("number is not divisible by 4, or 3");
}
```

Since `if` is an expression, you can use it as the result of a `let`:

```rust
let condition = true;
let number = if condition { 5 } else { 6 };
```

In that case every branch must produce the **same type**, since a variable has one and
only one type, known at compile time:

```rust
let number = if condition { 5 } else { "six" }; // compile error: incompatible types
```
