#[allow(unused_variable)]
module matryofund::pledge;

use sui::coin::Coin;
use sui::sui::SUI;

public struct Pledge has key, store {
    id: UID,
    project_id: UID,
    amount: u64,
}

public(package) fun create_pledge(ctx: &mut TxContext, project_id: UID, coin: Coin<SUI>): Pledge {
    // Consume the coin and extract its numeric amount
    let amount = coin.value();
    let pledge = Pledge {
        id: object::new(ctx),
        project_id,
        amount,
    };
    transfer::public_transfer(coin, @0x0);
    pledge
    // transfer::public_transfer(pledge, tx_context::sender(ctx));    // todo: emit event
}

// public fun refund_pledge(pledge: &Pledge): () { () }
