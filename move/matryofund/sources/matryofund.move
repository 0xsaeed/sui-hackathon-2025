#[allow(unused_use)]
module matryofund::matryofund;

use matryofund::pledge::{Pledge};
use matryofund::project::Project;
use sui::coin::Coin;
use sui::sui::SUI;

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

public struct AdminCap has key, store { id: UID }

/// Create the AdminCap object on package publish and transfer it to the
/// package owner.
fun init(ctx: &mut TxContext) {
    transfer::transfer(
        AdminCap { id: object::new(ctx) },
        ctx.sender(),
    )
}
