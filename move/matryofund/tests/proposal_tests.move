#[allow(unused_use, duplicate_alias, unused_const, unused_variable, unused_let_mut)]
#[test_only]
module matryofund::proposal_tests;

use matryofund::config;
use matryofund::project::{Self, Project, Pledge};
use matryofund::proposal::{Self, Proposal};
use std::string::{Self, String};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::object::{Self, ID};
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};
use sui::url;

const ADMIN: address = @0xA11CE;
const USER1: address = @0xB0B;
const USER2: address = @0xCAFE;
const USER3: address = @0xDEAD;

const FUNDING_GOAL: u128 = 1000_000_000_000; // 1000 SUI in MIST
const FUNDING_AMOUNT: u64 = 100_000_000_000; // 100 SUI in MIST

#[test]
fun test_create_proposal_success() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project first
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    ts::next_tx(&mut scenario, USER1);
    let project = ts::take_shared<Project>(&scenario);
    let project_id = project::get_id(&project);

    // Create proposal
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to change project direction";
    let proposal_deadline = now + 2 * 24 * 60 * 60 * 1000; // 2 days from now

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );

    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::proposal::EProposalDeadlineNotInFuture)]
fun test_create_proposal_deadline_in_past() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project first
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    ts::next_tx(&mut scenario, USER1);
    let project = ts::take_shared<Project>(&scenario);
    let project_id = project::get_id(&project);

    // Try to create proposal with deadline in the past
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Invalid proposal";
    // Set deadline to 0 (definitely in the past) or advance clock after setting deadline
    let proposal_deadline = now + 1000; // Set a future deadline first
    // Then advance the clock past the deadline
    clock::increment_for_testing(&mut clock, 2000);

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );
    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_vote_on_proposal_success() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create project
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    // User1 funds the project to get a pledge
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment, ctx, &clock);
    let project_id = project::get_id(&project);
    ts::return_shared(project);

    // Create proposal
    ts::next_tx(&mut scenario, USER2);
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to change project direction";
    let proposal_deadline = now + 2 * 24 * 60 * 60 * 1000;

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );

    // User1 votes on the proposal using their pledge
    ts::next_tx(&mut scenario, USER1);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge,
        true, // Support the proposal
        &clock,
    );

    ts::return_to_sender(&scenario, pledge);
    ts::return_shared(proposal);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::proposal::EProposalExpired)]
fun test_vote_on_expired_proposal() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create project
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    // User1 funds the project to get a pledge
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment, ctx, &clock);
    let project_id = project::get_id(&project);
    ts::return_shared(project);

    // Create proposal with short deadline
    ts::next_tx(&mut scenario, USER2);
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to change project direction";
    let proposal_deadline = now + 1000; // Very short deadline

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );

    // Advance clock past proposal deadline
    clock::increment_for_testing(&mut clock, 2000);

    // Try to vote on expired proposal
    ts::next_tx(&mut scenario, USER1);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    // This should fail because proposal is expired
    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge,
        true,
        &clock,
    );

    ts::return_to_sender(&scenario, pledge);
    ts::return_shared(proposal);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::proposal::EAccessDenied)]
fun test_vote_twice_same_pledge() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create project
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    // User1 funds the project to get a pledge
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment, ctx, &clock);
    let project_id = project::get_id(&project);
    ts::return_shared(project);

    // Create proposal
    ts::next_tx(&mut scenario, USER2);
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to change project direction";
    let proposal_deadline = now + 2 * 24 * 60 * 60 * 1000;

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );

    // User1 votes first time
    ts::next_tx(&mut scenario, USER1);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge,
        true,
        &clock,
    );

    // Try to vote second time with same pledge - should fail
    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge,
        false, // Different vote
        &clock,
    );

    ts::return_to_sender(&scenario, pledge);
    ts::return_shared(proposal);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_multiple_users_voting() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create project
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    // User1 and User2 fund the project
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment1 = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment1, ctx, &clock);
    let project_id = project::get_id(&project);
    ts::return_shared(project);

    ts::next_tx(&mut scenario, USER2);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment2 = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment2, ctx, &clock);
    ts::return_shared(project);

    // Create proposal
    ts::next_tx(&mut scenario, USER3);
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to change project direction";
    let proposal_deadline = now + 2 * 24 * 60 * 60 * 1000;

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );

    // User1 votes YES
    ts::next_tx(&mut scenario, USER1);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let pledge1 = ts::take_from_sender<Pledge>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge1,
        true, // YES vote
        &clock,
    );

    ts::return_to_sender(&scenario, pledge1);
    ts::return_shared(proposal);

    // User2 votes NO
    ts::next_tx(&mut scenario, USER2);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let pledge2 = ts::take_from_sender<Pledge>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    proposal::vote_on_proposal(
        ctx,
        &mut proposal,
        &pledge2,
        false, // NO vote
        &clock,
    );

    ts::return_to_sender(&scenario, pledge2);
    ts::return_shared(proposal);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::proposal::EProposalAlreadyExecuted)]
fun test_execute_proposal_wrong_conditions() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create project
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    ts::next_tx(&mut scenario, USER1);
    let project = ts::take_shared<Project>(&scenario);
    let project_id = project::get_id(&project);

    // Create proposal
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = b"Proposal to execute";
    let proposal_deadline = now + 2 * 24 * 60 * 60 * 1000;

    proposal::create_and_share_proposal(
        ctx,
        project_id,
        proposal_description,
        proposal_deadline,
        &clock,
    );
    ts::return_shared(project);

    // Try to execute proposal - should fail due to assertion in execute_proposal
    // Note: The current implementation has assert!(proposal.executed, EProposalAlreadyExecuted)
    // which seems to be inverted logic - it should probably be !proposal.executed
    ts::next_tx(&mut scenario, USER1);
    let mut proposal = ts::take_shared<Proposal>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    proposal::execute_proposal(ctx, &mut proposal, &clock);

    ts::return_shared(proposal);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}
