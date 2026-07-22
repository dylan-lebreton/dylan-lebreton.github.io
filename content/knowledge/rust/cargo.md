---
title: Cargo
tags:
  - rust
---

## Building and running

To build:

```bash
cargo build
```

To build and run:

```bash
cargo run
```

To check that the code compiles (without producing a binary):

```bash
cargo check
```

To build with optimisations:

```bash
cargo build --release
```

To build and run with optimisations:

```bash
cargo run --release
```

## Dependencies

Add a "crate", that is, a library:

```bash
cargo add rand
```

Libraries are added to `Cargo.toml`, and everything is pinned in `Cargo.lock`. To update
the libraries manually:

```bash
cargo update
```

To generate the documentation for all of the project's dependencies:

```bash
cargo doc --open
```
