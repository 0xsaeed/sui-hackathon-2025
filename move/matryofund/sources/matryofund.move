/// Module: matryofund
module matryofund::matryofund;

use matryofund::pledge::{Pledge, create_pledge};
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

public fun deposit_funds(ctx: &mut TxContext, project_id: UID, coin: SUI): Pledge {
    create_pledge(ctx, project_id, coin)
}
