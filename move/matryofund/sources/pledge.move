module matryofund::pledge;

use sui::sui::SUI;

public struct Pledge has key {
    id: UID,
    project_id: UID,
    amount: u64,
}

public fun mint_pledge(ctx: &mut TxContext, project_id: UID, coin: SUI): Pledge {
    let pledge = Pledge {
        id: UID::new(ctx),
        project_id,
        amount: coin.value(),
    };
    pledge
    // todo: store the coin in a vault or escrow
    // todo: check that project_id exists
    // todo: check project status
    // todo: emit event
}

public fun refund_pledge(pledge: Pledge): u64 {
    pledge.amount
}
