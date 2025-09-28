#[allow(unused_use, duplicate_alias, unused_const, unused_variable, unused_let_mut)]
#[test_only]
module matryofund::matryofund_tests;

use matryofund::config;
use matryofund::matryofund::{Self, AdminCap};
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

const FUNDING_GOAL: u64 = 1000_000_000_000; // 1000 SUI in MIST
const FUNDING_AMOUNT: u64 = 100_000_000_000; // 100 SUI in MIST

#[test]
fun test_init_creates_admin_cap() {
    let mut scenario = ts::begin(ADMIN);

    // Call init function (simulates package deployment)
    {
        let ctx = ts::ctx(&mut scenario);
        matryofund::init_for_testing(ctx);
    };

    // Verify AdminCap was created and sent to package deployer
    ts::next_tx(&mut scenario, ADMIN);
    let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

    // AdminCap should exist and be owned by ADMIN
    ts::return_to_sender(&scenario, admin_cap);

    ts::end(scenario);
}

#[test]
fun test_integration_create_project_and_fund() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Initialize matryofund module
    matryofund::init_for_testing(ctx);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project
    let title = string::utf8(b"Integration Test Project");
    let description = string::utf8(b"A project to test full integration");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Phase 1"), string::utf8(b"Phase 2")];
    let milestone_deadlines = vector[
        funding_deadline + 30 * 24 * 60 * 60 * 1000,
        funding_deadline + 60 * 24 * 60 * 60 * 1000,
    ];
    let milestone_percents = vector[60u8, 40u8];

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

    // User1 funds the project
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);

    project::deposit_funds(&mut project, payment, ctx, &clock);

    ts::return_shared(project);

    // Verify pledge was created
    ts::next_tx(&mut scenario, USER1);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    ts::return_to_sender(&scenario, pledge);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_integration_full_crowdfunding_cycle() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Initialize matryofund module
    matryofund::init_for_testing(ctx);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project
    let title = string::utf8(b"Full Cycle Project");
    let description = string::utf8(b"Testing complete crowdfunding cycle");
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

    // Multiple users fund the project
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment1 = coin::mint_for_testing<SUI>(400_000_000_000, ctx); // 400 SUI
    project::deposit_funds(&mut project, payment1, ctx, &clock);
    ts::return_shared(project);

    ts::next_tx(&mut scenario, USER2);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment2 = coin::mint_for_testing<SUI>(600_000_000_000, ctx); // 600 SUI
    project::deposit_funds(&mut project, payment2, ctx, &clock);
    ts::return_shared(project);

    // Advance time past funding deadline
    clock::increment_for_testing(&mut clock, 8 * 24 * 60 * 60 * 1000);

    // Finish funding (should be successful)
    ts::next_tx(&mut scenario, ADMIN);
    let mut project = ts::take_shared<Project>(&scenario);
    project::finish_funding(&mut project, &clock);
    ts::return_shared(project);

    // Create a proposal for the funded project
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let proposal_description = string::utf8(b"Proposal for project modification");
    // Set deadline to 2 days from current time (well within 7-day max limit)
    let proposal_deadline = clock::timestamp_ms(&clock) + 2 * 24 * 60 * 60 * 1000;

    proposal::create_and_share_proposal(
        ctx,
        &mut project,
        proposal_description,
        proposal_deadline,
        &clock,
    );
    ts::return_shared(project);

    // Users vote on the proposal
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
fun test_integration_failed_funding() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Initialize matryofund module
    matryofund::init_for_testing(ctx);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project with high funding goal
    let title = string::utf8(b"High Goal Project");
    let description = string::utf8(b"Project that will fail funding");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;
    let high_funding_goal = 1000000_000_000_000; // Very high goal

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[100u8];

    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        high_funding_goal,
        false,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    // User funds but not enough to meet the goal
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx); // Much less than goal

    project::deposit_funds(&mut project, payment, ctx, &clock);
    ts::return_shared(project);

    // Advance time past funding deadline
    clock::increment_for_testing(&mut clock, 8 * 24 * 60 * 60 * 1000);

    // Finish funding (should fail due to insufficient funds)
    ts::next_tx(&mut scenario, ADMIN);
    let mut project = ts::take_shared<Project>(&scenario);
    project::finish_funding(&mut project, &clock);
    ts::return_shared(project);

    // User should still have their pledge
    ts::next_tx(&mut scenario, USER1);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    ts::return_to_sender(&scenario, pledge);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_integration_pledge_transfer() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Initialize matryofund module
    matryofund::init_for_testing(ctx);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Create a project
    let title = string::utf8(b"Transfer Test Project");
    let description = string::utf8(b"Testing pledge transfers");
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

    // USER1 funds the project
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);

    project::deposit_funds(&mut project, payment, ctx, &clock);
    ts::return_shared(project);

    // USER1 transfers pledge to USER2
    ts::next_tx(&mut scenario, USER1);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    project::transfer_pledge(pledge, USER2, ctx);

    // Verify USER2 now has the pledge
    ts::next_tx(&mut scenario, USER2);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    ts::return_to_sender(&scenario, pledge);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_admin_cap_ownership() {
    let mut scenario = ts::begin(ADMIN);

    // Initialize matryofund module
    {
        let ctx = ts::ctx(&mut scenario);
        matryofund::init_for_testing(ctx);
    };

    // Check that ADMIN has the AdminCap
    ts::next_tx(&mut scenario, ADMIN);
    let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

    // Admin can transfer the capability to another address
    transfer::public_transfer(admin_cap, USER1);

    // Verify USER1 now has the AdminCap
    ts::next_tx(&mut scenario, USER1);
    let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
    ts::return_to_sender(&scenario, admin_cap);

    ts::end(scenario);
}

#[test]
fun test_config_constants() {
    // Test that config module constants are accessible
    let commission_rate = config::commission_fee_rate();
    assert!(commission_rate == 1, 0);

    let voting_period = config::voting_period();
    assert!(voting_period == 2 * 24 * 60 * 60, 1);

    let minimum_quorum = config::minimum_quorum();
    assert!(minimum_quorum == 1, 2);

    let acceptance_rate = config::minimum_acceptance_rate();
    assert!(acceptance_rate == 51, 3);

    // Test status constants
    assert!(config::status_funding() == 0, 4);
    assert!(config::status_failed() == 1, 5);
    assert!(config::status_active() == 2, 6);
    assert!(config::status_voting() == 3, 7);
    assert!(config::status_rejected() == 4, 8);
    assert!(config::status_closed() == 5, 9);
}
