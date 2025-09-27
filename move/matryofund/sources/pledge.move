module matryofund::pledge;

use sui::sui::SUI;

public struct Pledge has key {
    id: UID,
    project_id: UID,
    amount: u64,
}

public(package) mint_pledge(ctx: &mut TxContext, project_id: UID, coin: SUI): Pledge {
    let pledge = Pledge {
        id: UID::new(ctx),
        project_id,
        amount: coin.value(),
    };
    pledge
    // todo: emit event
}

public fun refund_pledge(pledge: Pledge): u64 {
    pledge.amount
}
