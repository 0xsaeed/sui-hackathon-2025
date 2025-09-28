#[allow(unused_use, unused_const, unused_variable, unused_field)]
module matryofund::proposal;

use matryofund::config;
use matryofund::project::{Self, Pledge, Project};
use std::string::{String, utf8};
use sui::clock::{Clock, timestamp_ms};

// ###################### constants ##########################
const EAccessDenied: u64 = 1;
const EProposalExpired: u64 = 2;
const EProposalAlreadyExecuted: u64 = 3;
const EProposalOnVoting: u64 = 4;
const EProposalDeadlineNotInFuture: u64 = 5;
const EProjectNotActive: u64 = 6;
const EProjectAlreadyInVoting: u64 = 7;
const EProposalDeadlineTooShort: u64 = 8;
const EProposalDeadlineTooLong: u64 = 9;

// ###################### structs ##########################
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

// ###################### Events ##########################
public struct ProposalCreatedEvent has copy, drop {
    proposal_id: ID,
    project_id: ID,
    proposer: address,
    description: String,
    deadline: u64,
}

public struct ProposalExecutedEvent has copy, drop {
    proposal_id: ID,
    project_id: ID,
    executed: bool,
    yes_votes: u64,
    no_votes: u64,
}

public struct VoteCastEvent has copy, drop {
    proposal_id: ID,
    project_id: ID,
    voter_pledge: ID,
    voter_address: address,
    support: bool,
}
// ###################### public functions ##########################

public fun create_proposal(
    ctx: &mut TxContext,
    project: &mut Project,
    description: String,
    deadline: u64,
    clk: &Clock,
): Proposal {
    let current_time: u64 = timestamp_ms(clk);
    let project_status = project::get_status(project);
    let project_id = project::get_id(project);

    // Validate project state - only active projects can have proposals
    assert!(project_status == config::status_active(), EProjectNotActive);
    // Check deadline is in the future first to avoid underflow
    assert!(current_time < deadline, EProposalDeadlineNotInFuture);

    let proposal_duration = deadline - current_time;
    assert!(proposal_duration >= config::min_voting_period(), EProposalDeadlineTooShort);
    assert!(proposal_duration <= config::max_voting_period(), EProposalDeadlineTooLong);

    // Change project status to voting
    project::set_status_voting(project);

    Proposal {
        id: object::new(ctx),
        project_id,
        proposer: ctx.sender(),
        description,
        deadline,
        yes_votes: 0,
        no_votes: 0,
        executed: false,
        voters: vector[],
    }
}

public fun execute_proposal(
    ctx: &mut TxContext,
    proposal: &mut Proposal,
    project: &mut Project,
    clk: &Clock,
) {
    let current_time: u64 = timestamp_ms(clk);
    assert!(!proposal.executed, EProposalAlreadyExecuted);
    assert!(current_time > proposal.deadline, EProposalExpired);
    assert!(project::get_status(project) == config::status_voting(), EProjectNotActive);

    // Check if proposal passed (you can adjust the logic based on your requirements)
    let total_votes = proposal.yes_votes + proposal.no_votes;

    if (proposal.yes_votes >= proposal.no_votes) {
        // Proposal passed - logic to transfer funds to the project owner would go here
        project::set_status_active(project);
    } else {
        // Proposal rejected
        project::set_status_rejected(project);
    };

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

// ##################### Test Function ##########################
#[test_only]
public fun create_and_share_proposal(
    ctx: &mut TxContext,
    project: &mut Project,
    description: String,
    deadline: u64,
    clk: &Clock,
) {
    let proposal = create_proposal(ctx, project, description, deadline, clk);
    transfer::share_object(proposal);
}
