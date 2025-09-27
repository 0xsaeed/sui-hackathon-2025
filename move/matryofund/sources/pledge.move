#[allow(unused_use, unused_variable)]
module matryofund::pledge;

use matryofund::project::{Milestone, Project};
use sui::coin::Coin;
use sui::sui::SUI;

public struct Pledge has key, store {
    id: UID,
    project_id: UID,
    amount: u64,
}

public(package) fun create_pledge(
    project_id: UID,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Pledge {
    let amount = payment.value();

    // Add the payment to campaign's escrow
    transfer::public_transfer(payment, @0x2);
    let pledge = Pledge {
        id: object::new(ctx),
        project_id: project_id,
        amount,
    };

    // TODO: emit event
    pledge
}

public fun refund_pledge(pledge: &Pledge): () {}
