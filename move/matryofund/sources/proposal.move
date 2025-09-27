#[allow(unused_use, unused_const, unused_variable)]
module matryofund::proposal;

use matryofund::config;
use matryofund::project::Pledge;
use std::string::{String, utf8};
use sui::clock::{Clock, timestamp_ms};

const EAccessDenied: u64 = 1;
const EProposalExpired: u64 = 2;
const EProposalAlreadyExecuted: u64 = 3;
const EProposalOnVoting: u64 = 4;
const EProposalDeadlineNotInFuture: u64 = 5;

public struct Proposal has key {
    id: UID,
    project_id: ID,
    proposer: address,
    description: String,
    deadline: u64,
    yes_votes: u64,
    no_votes: u64,
    executed: bool,
    voters: vector<ID>,
}

public fun create_proposal(
    ctx: &mut TxContext,
    project_id: ID,
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
        voters: vector[],
    }
    // todo change project status to voting
}

#[test_only]
public fun create_and_share_proposal(
    ctx: &mut TxContext,
    project_id: ID,
    description: vector<u8>,
    deadline: u64,
    clk: &Clock,
) {
    let proposal = create_proposal(ctx, project_id, description, deadline, clk);
    transfer::share_object(proposal);
}

public fun execute_proposal(ctx: &mut TxContext, proposal: &mut Proposal, clk: &Clock) {
    let current_time: u64 = timestamp_ms(clk);
    assert!(proposal.executed, EProposalAlreadyExecuted);
    assert!(current_time <= proposal.deadline, EProposalOnVoting);

    // Logic to transfer funds to the project owner would go here

    proposal.executed = true;
}

public fun vote_on_proposal(
    ctx: &mut TxContext,
    proposal: &mut Proposal,
    pledge: &Pledge,
    support: bool,
    clk: &Clock,
    // pledge: &Pledge,
) {
    let current_time: u64 = timestamp_ms(clk);
    let pledge_id = object::id(pledge);

    // validations
    assert!(current_time <= proposal.deadline, EProposalExpired);
    assert!(!proposal.executed, EProposalAlreadyExecuted);
    // assert!(&pledge.project_id == &proposal.project_id, EAccessDenied);
    assert!(!vector::contains(&proposal.voters, &pledge_id), EAccessDenied); // change the vote

    // record the vote
    if (support) {
        proposal.yes_votes = proposal.yes_votes + 1;
    } else {
        proposal.no_votes = proposal.no_votes + 1;
    };
    vector::push_back(&mut proposal.voters, pledge_id);
}
