#[allow(unused_use, unused_variable)]
module matryofund::pledge;

use matryofund::project::{Self, Milestone, Project};
use std::string::String;
use sui::coin::Coin;
use sui::event;
use sui::sui::SUI;
use sui::url::{Self, Url};

public struct Pledge has key, store {
    id: UID,
    project_id: ID,
    amount: u64,
    name: String,
    description: String,
    image_url: Url,
}

public fun deposit_funds(project: &Project, payment: Coin<SUI>, ctx: &mut TxContext) {
    let amount = payment.value();
    transfer::public_transfer(payment, @0x2); // escrow
    let pledge = Pledge {
        id: object::new(ctx),
        project_id: project::get_id(project),
        amount,
        name: project::title(project),
        description: project::description(project),
        image_url: project::image_url(project),
    };
    // send pledge NFT to backer
    transfer::public_transfer(pledge, tx_context::sender(ctx));
}

public fun refund(pledge: &Pledge): () {}

public fun transfer_pledge(pledge: Pledge, recipient: address) {
    transfer::public_transfer(pledge, recipient);
}
