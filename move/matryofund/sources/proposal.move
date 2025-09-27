#[allow(unused_use, unused_const)]
module matryofund::proposal;

use matryofund::config;
use matryofund::pledge::Pledge;
use std::string::{String, utf8};
use sui::clock::{Clock, timestamp_ms};

const EAccessDenied: u64 = 1;
const EProposalExpired: u64 = 2;
const EProposalAlreadyExecuted: u64 = 3;
const EProposalOnVoting: u64 = 4;
const EProposalDeadlineNotInFuture: u64 = 5;

public struct Proposal has key {
    id: UID,
    project_id: UID,
    proposer: address,
    description: String,
    deadline: u64,
    yes_votes: u64,
    no_votes: u64,
    executed: bool,
}

public fun create_proposal(
    ctx: &mut TxContext,
    project_id: UID,
    description: vector<u8>,
    deadline: u64,
    clk: &Clock,
    // pledge_id: Option<UID>,
): Proposal {
    let current_time: u64 = timestamp_ms(clk);
    assert!(current_time < deadline, EProposalDeadlineNotInFuture);
    Proposal {
        id: object::new(ctx),
        project_id,
        proposer: ctx.sender(),
        description: utf8(description),
        deadline,
        yes_votes: 0,
        no_votes: 0,
        executed: false,
    }
}

public fun execute_proposal(ctx: &mut TxContext, proposal: &mut Proposal, clk: &Clock) {
    let current_time: u64 = timestamp_ms(clk);
    assert!(proposal.executed, EProposalAlreadyExecuted);
    assert!(current_time <= proposal.deadline, EProposalOnVoting);

    // Logic to transfer funds to the project owner would go here

    proposal.executed = true;
}
