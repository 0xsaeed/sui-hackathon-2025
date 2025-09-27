---
description: 'Next.js + Tailwind development standards and instructions'
applyTo: '**/*.move, **/Move.toml'
---

# GitHub Copilot Instructions for Move Development on Sui

This repository contains **Move smart contracts** designed for the **Sui blockchain**. The following instructions guide GitHub Copilot (and contributors) on how to structure, write, and document code in the `move/` directory.

## 📂 Directory Scope

* All Move source code lives under the `move/` directory.
* Test files are placed in `move/tests/`.
* The build output is generated in `move/build/` and should **not** be used by Copilot for suggestions.

## 📝 General Guidelines

### 1. Module Declaration
* Always declare modules in the format:

```move
module <address>::<ModuleName> {
    // ...
}
```

* Use the `0x` hex address or named addresses configured in `Move.toml`.

### 2. Entry Functions
* Public transaction entry points must be declared as:

```move
public entry fun function_name(
    ctx: &mut TxContext,
    // other parameters
) {
    // implementation
}
```

* Always include `TxContext` as the last parameter in entry functions.

### 3. Resource Safety
* Respect the Move ownership model: no resource should be implicitly discarded.
* Avoid unnecessary `copy` or `drop` of `key` resources.
* Ensure proper transfer or destruction of resources.

### 4. Coin Handling
* Always use the official Sui `coin` module for minting, splitting, merging, and transferring coins.
* Example best practice:

```move
let coin_part = Coin::split(&mut coin, amount, ctx);
transfer::public_transfer(coin_part, recipient);
```

### 5. Error Handling
* Define a dedicated `const` section with error codes at the top of each module.
* Example:

```move
const E_NOT_AUTHORIZED: u64 = 0;
const E_INVALID_AMOUNT: u64 = 1;
```

### 6. Documentation
* Use `///` doc comments above all public functions and structs.
* Example:

```move
/// Splits a coin into two parts.
public fun split_coin(coin: &mut Coin<SUI>, amount: u64, ctx: &mut TxContext): Coin<SUI> { ... }
```

### 7. Testing
* Place test files under `move/tests/`.
* Use the Move native testing framework:

```move
#[test]
fun test_split_coin() {
    // arrange, act, assert
}
```

## ✅ Copilot Prompts to Use

When working inside `move/`, you can ask Copilot for:

* **Scaffold a module**: `"Write a Move module on Sui with a resource struct and one entry function to publish it."`
* **Coin management**: `"Generate a function that accepts a Coin<SUI>, splits it by an amount, and transfers the result to a recipient."`
* **Error codes**: `"Add error codes and return an error if the split amount is greater than the balance."`
* **Tests**: `"Generate a Move unit test for verifying that coin splitting fails if the amount is zero."`

## 🚫 What to Avoid

* Do **not** hardcode addresses; use named addresses from `Move.toml`.
* Do **not** discard resources silently (e.g., forgetting to move them).
* Do **not** bypass coin safety by manually editing balances.
* Do **not** mix test code with production modules.

## ⚙️ Recommended Setup

### EditorConfig (`.editorconfig`):

```ini
[*.move]
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true
```

### Ignored Paths (`.gitignore`):

```gitignore
move/build/
```