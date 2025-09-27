module matryofund::pledge;

use sui::coin;
use sui::sui::SUI;

public struct Pledge has key {
    id: UID,
    project_id: UID,
    amount: u64,
}

public(package) fun create_pledge(ctx: &mut TxContext, project_id: UID, coin: SUI): Pledge {
    // Consume the coin and extract its numeric amount
    let amount = coin::into_value(coin);
    let pledge = Pledge {
        id: object::new(ctx),
        project_id,
        amount,
    };
    pledge
    // todo: emit event
}

public fun refund_pledge(pledge: Pledge) {}
