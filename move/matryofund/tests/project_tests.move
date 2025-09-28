#[allow(unused_use,duplicate_alias,unused_const,unused_variable,unused_let_mut)]
#[test_only]
module matryofund::project_tests;

use matryofund::config;
use matryofund::project::{Self, Project, Pledge};
use std::string::{Self, String};
use sui::balance;
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};
use sui::url;

const ADMIN: address = @0xA11CE;
const USER1: address = @0xB0B;
const USER2: address = @0xCAFE;

const FUNDING_GOAL: u64 = 1000_000_000_000; // 1000 SUI in MIST
const FUNDING_AMOUNT: u64 = 100_000_000_000; // 100 SUI in MIST
const SMALL_FUNDING_AMOUNT: u64 = 50_000_000_000; // 50 SUI in MIST

#[test]
fun test_create_project_success() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    // Create clock
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    // Project parameters
    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project for crowdfunding");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000; // 7 days from now
    let close_on_funding_goal = true;

    // Milestone data
    let milestone_titles = vector[
        string::utf8(b"Development"),
        string::utf8(b"Testing"),
        string::utf8(b"Deployment"),
    ];
    let milestone_deadlines = vector[
        funding_deadline + 30 * 24 * 60 * 60 * 1000, // 30 days after funding
        funding_deadline + 60 * 24 * 60 * 60 * 1000, // 60 days after funding
        funding_deadline + 90 * 24 * 60 * 60 * 1000, // 90 days after funding
    ];
    let milestone_percents = vector[50u8, 30u8, 20u8]; // Must sum to 100

    // Create project
    project::create_project(
        title,
        description,
        image_url,
        link,
        funding_deadline,
        FUNDING_GOAL,
        close_on_funding_goal,
        milestone_titles,
        milestone_deadlines,
        milestone_percents,
        &clock,
        ctx,
    );

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::project::EMilestoneInvalidPercentage)]
fun test_create_project_invalid_milestone_percentage() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let milestone_titles = vector[string::utf8(b"Development")];
    let milestone_deadlines = vector[funding_deadline + 30 * 24 * 60 * 60 * 1000];
    let milestone_percents = vector[120u8]; // Invalid: greater than 100

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

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_deposit_funds_success() {
    let mut scenario = ts::begin(ADMIN);

    // Create project first
    let ctx = ts::ctx(&mut scenario);
    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

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

    // User1 deposits funds
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);

    project::deposit_funds(&mut project, payment, ctx, &clock);

    ts::return_shared(project);

    // Check that pledge NFT was created
    ts::next_tx(&mut scenario, USER1);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    ts::return_to_sender(&scenario, pledge);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = matryofund::project::EFundingAlreadyEnded)]
fun test_deposit_funds_after_deadline() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);
    let funding_deadline = now + 1000; // Very short deadline

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");

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

    // Advance clock past deadline
    clock::increment_for_testing(&mut clock, 2000);

    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);

    // This should fail because deadline has passed
    project::deposit_funds(&mut project, payment, ctx, &clock);

    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_finish_funding_successful() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");

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

    // Fund the project to meet the goal
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    // Fund with enough to meet the goal
    let payment1 = coin::mint_for_testing<SUI>((FUNDING_GOAL as u64), ctx);
    project::deposit_funds(&mut project, payment1, ctx, &clock);

    // Advance clock past deadline
    clock::increment_for_testing(&mut clock, 8 * 24 * 60 * 60 * 1000);

    // Finish funding
    project::finish_funding(&mut project, &clock);

    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_finish_funding_failed() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");

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

    // Fund the project but not enough to meet the goal
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);

    let payment = coin::mint_for_testing<SUI>(SMALL_FUNDING_AMOUNT, ctx);
    project::deposit_funds(&mut project, payment, ctx, &clock);

    // Advance clock past deadline
    clock::increment_for_testing(&mut clock, 8 * 24 * 60 * 60 * 1000);

    // Finish funding - should result in failed status
    project::finish_funding(&mut project, &clock);

    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_transfer_pledge() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);
    let funding_deadline = now + 7 * 24 * 60 * 60 * 1000;

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project");
    let image_url = url::new_unsafe_from_bytes(b"https://example.com/image.png");
    let link = url::new_unsafe_from_bytes(b"https://example.com");

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

    // User1 deposits funds and gets pledge
    ts::next_tx(&mut scenario, USER1);
    let mut project = ts::take_shared<Project>(&scenario);
    let ctx = ts::ctx(&mut scenario);
    let payment = coin::mint_for_testing<SUI>(FUNDING_AMOUNT, ctx);

    project::deposit_funds(&mut project, payment, ctx, &clock);
    ts::return_shared(project);

    // User1 transfers pledge to User2
    ts::next_tx(&mut scenario, USER1);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    project::transfer_pledge(pledge, USER2, ctx);

    // Verify User2 now has the pledge
    ts::next_tx(&mut scenario, USER2);
    let pledge = ts::take_from_sender<Pledge>(&scenario);
    ts::return_to_sender(&scenario, pledge);

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
fun test_project_view_functions() {
    let mut scenario = ts::begin(ADMIN);
    let ctx = ts::ctx(&mut scenario);

    let mut clock = clock::create_for_testing(ctx);
    let now = clock::timestamp_ms(&clock);

    let title = string::utf8(b"Test Project");
    let description = string::utf8(b"A test project for viewing");
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

    ts::next_tx(&mut scenario, ADMIN);
    let project = ts::take_shared<Project>(&scenario);

    // Test view functions
    let _ = project::get_id(&project);
    let project_title = project::get_title(&project);
    let project_description = project::get_description(&project);
    let project_image_url = project::get_image_url(&project);

    // Verify values match what we set
    assert!(project_title == title, 0);
    assert!(project_description == description, 1);
    assert!(project_image_url == image_url, 2);

    ts::return_shared(project);
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}
