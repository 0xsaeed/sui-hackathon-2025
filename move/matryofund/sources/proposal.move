#[allow(unused_use, unused_const, unused_variable, unused_field)]
module matryofund::proposal;

use matryofund::config;
use matryofund::project::{Self, Pledge, Project};
use std::string::{String, utf8};
use sui::clock::{Clock, timestamp_ms};
use sui::event;


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
) {
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
    project::change_project_status(project, config::status_voting());

    let proposal = Proposal {
        id: object::new(ctx),
        project_id,
        proposer: ctx.sender(),
        description,
        deadline,
        yes_votes: 0,
        no_votes: 0,
        executed: false,
        voters: vector[],
    };
    let proposal_id = object::id(&proposal);
    transfer::share_object(proposal);
    let event = ProposalCreatedEvent {
        proposal_id,
        project_id,
        proposer: ctx.sender(),
        description,
        deadline,
    };
    event::emit(event);
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
    let total_raised = project::get_total_raised(project);
    let current_quorum =((total_votes * 100) / total_raised);
    if (current_quorum < config::minimum_quorum()) {
        // Not enough quorum - reject proposal but keep project active
        project::change_project_status(project, config::status_active());
    } else {
        if (proposal.yes_votes >= proposal.no_votes) {
            // Proposal passed - logic to transfer funds to the project owner would go here
            project::change_project_status(project, config::status_active());
        } else {
            // Proposal rejected
            project::change_project_status(project, config::status_rejected());
        };
    };
    proposal.executed = true;
    let event = ProposalExecutedEvent {
        proposal_id: object::id(proposal),
        project_id: proposal.project_id,
        executed: proposal.executed,
        yes_votes: proposal.yes_votes,
        no_votes: proposal.no_votes,
    };
    event::emit(event);
}

public fun vote_on_proposal(
    ctx: &mut TxContext,
    proposal: &mut Proposal,
    pledge: &Pledge,
    support: bool,
    clk: &Clock,
){
    let current_time: u64 = timestamp_ms(clk);
    let pledge_id = object::id(pledge);
    let proposal_id = object::id(proposal);

    // validations
    assert!(current_time <= proposal.deadline, EProposalExpired);
    
    // check pledge voted already
    assert!(!vector::contains(&proposal.voters, &pledge_id), EAccessDenied);

    // check pledge belongs to the same project as the proposal
    assert!(project::get_pledge_project_id(pledge) == proposal.project_id, EAccessDenied);

    // record the vote
        let weight = project::get_pledge_amount(pledge);

    if (support) {
        proposal.yes_votes = proposal.yes_votes + weight;
    } else {
        proposal.no_votes = proposal.no_votes + weight;
    };
    vector::push_back(&mut proposal.voters, pledge_id);
    let event = VoteCastEvent {
        proposal_id,
        project_id: proposal.project_id,
        voter_pledge: pledge_id,
        voter_address: ctx.sender(),
        support,
    };
    event::emit(event);
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
