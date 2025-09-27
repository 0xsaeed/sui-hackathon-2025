module matryofund::pledge;

use sui::sui::SUI;

public struct Pledge has key {
    id: UID,
    project_id: UID,
    amount: u64,
}

public fun mint_pledge(account: &signer, project_id: UID, amount: u64): Pledge {
    let pledge = Pledge {
        id: UID::new(account),
        project_id,
        amount,
    };
    pledge
}

public fun refund_pledge(pledge: Pledge): u64 {
    pledge.amount
}
