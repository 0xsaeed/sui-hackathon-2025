#[allow(unused_variable)]
module matryofund::pledge;

use sui::coin::Coin;
use sui::sui::SUI;

public struct Pledge has key, store {
    id: UID,
    project_id: UID,
    amount: u64,
}

#[allow(unused_variable)]
module matryofund::pledge;

use sui::coin::Coin;
use sui::sui::SUI;

public struct Pledge has key, store {
    id: UID,
    project_id: UID,
    amount: u64,
}

public(package) fun create_pledge(
    campaign: &mut Campaign,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Pledge {
    let amount = payment.value();

    // Add the payment to campaign's escrow
    let balance = payment.split(amount, ctx).into_balance();

    // Update total funded amount
    campaign.total_funded = campaign.total_funded + amount;

    let pledge = Pledge {
        id: object::new(ctx),
        project_id: object::uid_to_inner(&campaign.id),
        amount,
        pledger: tx_context::sender(ctx),
    };

    // TODO: emit event
    pledge
}

public fun refund_pledge(pledge: &Pledge): () {}


public fun refund_pledge(pledge: &Pledge): () {  }
