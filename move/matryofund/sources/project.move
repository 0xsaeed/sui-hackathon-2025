#[allow(unused_field, unused_variable, unused_use, unused_const, lint(self_transfer))]
module matryofund::project;

use matryofund::config;
use std::string::String;
use sui::balance::{Self, Balance};
use sui::clock::Clock;
use sui::coin::Coin;
use sui::event;
use sui::sui::SUI;
use sui::url::{Self, Url};

//  ########################### constants ######
const EOnlyCreator: u64 = 1;
const EOnlyAdmin: u64 = 2;
const EProjectNotActive: u64 = 3;
const EFundingNotEnded: u64 = 4;
const EFundingAlreadyEnded: u64 = 5;
const EFundingDeadlineNotPassed: u64 = 6;
const EInsufficientFunds: u64 = 7;
const ENoMoreMilestones: u64 = 8;
const EMilestoneAlreadyClaimed: u64 = 9;
const EMilestoneDeadlineNotReached: u64 = 10;
const EMilestoneInvalidPercentage: u64 = 11;
const EMilestoneInvalidData: u64 = 12;
const EProjectNotFailed: u64 = 13;

// ###################### structs ##########################
public struct Project has key {
    id: UID,
    creator: address,
    title: String,
    description: String,
    image_url: Url,
    link: Url,
    funding_start: u64,
    funding_deadline: u64,
    funding_goal: u64,
    total_raised: u64, // total contributed (MIST)
    total_withdrawn_percentage: u8, // total withdrawn by creator (%)
    close_on_funding_goal: bool, // auto-close funding when goal is reached
    milestones: vector<Milestone>, // must sum to 100
    milestone_index: u8, // next milestone to open/finalize
    status: u8, // false when canceled or fully completed
    vault: Balance<SUI>, // escrow storage
}

public struct Milestone has copy, store {
    title: String,
    deadline: u64,
    is_claimed: bool,
    release_percentage: u8,
}

public struct Pledge has key, store {
    id: UID,
    project_id: ID,
    amount: u64,
    name: String,
    description: String,
    image_url: Url,
}

// ####################### Events #####################

public struct ProjectCreatedEvent has copy, drop {
    project_id: ID,
    creator: address,
    title: String,
    description: String,
    image_url: Url,
    link: Url,
    funding_start: u64,
    funding_deadline: u64,
    funding_goal: u64,
    close_on_funding_goal: bool,
    // milestones: vector<Milestone>, // cannot emit complex types
}

public struct ProjectFundedEvent has copy, drop {
    project_id: ID,
    amount: u64,
}

public struct ProjectRefundedEvent has copy, drop {
    project_id: ID,
    pledge_id: ID,
    backer: address,
    amount: u64,
}

public struct ProjectStatusChangedEvent has copy, drop {
    project_id: ID,
    new_status: u8,
}

public struct MilestoneClaimedEvent has copy, drop {
    project_id: ID,
    milestone_index: u8,
    title: String,
    release_percentage: u8,
    amount_released: u64,
}
public struct PledgeTransferredEvent has copy, drop {
    pledge_id: ID,
    project_id: ID,
    from: address,
    to: address,
}
// ############################### Public Functions ##################################

/// Create a new project and SHARE it.
public fun create_project(
    title: String,
    description: String,
    image_url: Url,
    link: Url,
    funding_deadline: u64,
    funding_goal: u64,
    close_on_funding_goal: bool,
    milestone_titles: vector<String>,
    milestone_deadlines: vector<u64>,
    milestone_percents: vector<u8>,
    clk: &Clock,
    ctx: &mut TxContext,
) {
    let now = sui::clock::timestamp_ms(clk);
    let mut milestones: vector<Milestone> = vector[];
    let n = vector::length(&milestone_titles);
    assert!(n > 0, 1);
    assert!(n == vector::length(&milestone_deadlines), EMilestoneInvalidData);
    assert!(n == vector::length(&milestone_percents), EMilestoneInvalidData);
    assert!(n < 100, ENoMoreMilestones);
    let mut i = 0;
    let mut total_percentage = 0;
    let mut last_deadline = now;
    while (i < n) {
        assert!(milestone_deadlines[i] > last_deadline, EMilestoneInvalidData);
        last_deadline = milestone_deadlines[i];
        let ms = Milestone {
            title: milestone_titles[i],
            deadline: milestone_deadlines[i],
            is_claimed: false,
            release_percentage: milestone_percents[i],
        };
        total_percentage = total_percentage + milestone_percents[i];
        vector::push_back(&mut milestones, ms);
        i = i + 1;
    };
    assert!(total_percentage == 100, EMilestoneInvalidPercentage);

    let project = Project {
        id: sui::object::new(ctx),
        creator: ctx.sender(),
        title,
        description,
        image_url,
        link,
        funding_start: now,
        funding_deadline,
        funding_goal,
        total_raised: 0u64,
        total_withdrawn_percentage: 0u8,
        close_on_funding_goal,
        milestones,
        milestone_index: 0u8,
        status: config::status_funding(),
        vault: balance::zero<SUI>(),
    };

    // Share the project object
    transfer::share_object(project);
}

public fun finish_funding(project: &mut Project, clk: &Clock) {
    let now = sui::clock::timestamp_ms(clk);
    if (project.close_on_funding_goal && project.total_raised >= project.funding_goal) {
        // Successful funding
        project.status = config::status_active();
    } else {
        assert!(now >= project.funding_deadline, EFundingDeadlineNotPassed);
        if (project.total_raised >= project.funding_goal) {
            // Successful funding
            project.status = 2; // active
        } else {
            // Failed funding
            project.status = config::status_failed();
        }
    };
}

public fun deposit_funds(
    project: &mut Project,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
    clk: &Clock,
) {
    assert!(project.status == config::status_funding(), EProjectNotActive);
    let now = sui::clock::timestamp_ms(clk);
    assert!(now < project.funding_deadline, EFundingAlreadyEnded);
    let amount = payment.value() as u64;
    project.vault.join(payment.into_balance());
    project.total_raised = project.total_raised + (amount as u64);

    let pledge = Pledge {
        id: object::new(ctx),
        project_id: get_id(project),
        amount,
        name: project.title,
        description: project.description,
        image_url: project.image_url,
    };
    // send pledge NFT to backer
    transfer::public_transfer(pledge, ctx.sender());
}

public fun transfer_pledge(pledge: Pledge, recipient: address, ctx: &mut TxContext) {
    let event = PledgeTransferredEvent {
        pledge_id: object::id(&pledge),
        project_id: pledge.project_id,
        from: ctx.sender(),
        to: recipient,
    };
    transfer::public_transfer(pledge, recipient);
    event::emit(event);
}

public fun refund(pledge: Pledge, project: &mut Project, ctx: &mut TxContext): () {
    assert!(
        project.status == config::status_failed() || project.status == config::status_rejected(),
        EProjectNotFailed,
    );
    let pledge_id = object::id(&pledge);
    let backer = tx_context::sender(ctx);
    let Pledge { id, project_id, amount, .. } = pledge;
    
    let amount_to_refund = if (project.status != config::status_failed()) {
        amount as u64
    } else {
        amount * (100u64-(project.total_withdrawn_percentage as u64)) / 100u64
    };

    let refund_balance = project.vault.split(amount_to_refund);

    // turn it back into a Coin<SUI>
    let refund_coin = refund_balance.into_coin(ctx);

    // transfer refund to backer
    transfer::public_transfer(refund_coin, backer);

    // Emit refund event
    let event = ProjectRefundedEvent {
        project_id,
        pledge_id,
        backer,
        amount,
    };

    // burn the pledge NFT
    object::delete(id);
    event::emit(event);
}

public fun claim_milestone(project: &mut Project, clk: &Clock, ctx: &mut TxContext) {
    assert!(ctx.sender() == project.creator, EOnlyCreator);
    assert!(project.status == config::status_active(), EProjectNotActive);
    // TODOOOOOOO

    // If all milestones claimed, close the project
    if (project.total_withdrawn_percentage == 100) {
        project.status = config::status_closed();
    };
}

// ######################################## View Functions ##################################
public fun get_id(project: &Project): ID { object::id(project) }

public fun get_title(project: &Project): String { project.title }

public fun get_description(project: &Project): String { project.description }

public fun get_image_url(project: &Project): Url { project.image_url }

public fun get_status(project: &Project): u8 { project.status }

// ######################################## package Functions ##################################

public(package) fun change_project_status(project: &mut Project, new_status: u8) {
    project.status = new_status;
    let event = ProjectStatusChangedEvent {
        project_id: get_id(project),
        new_status,
    };
    event::emit(event);
}
// public(package) fun set_status_voting(project: &mut Project) {
//     project.status = config::status_voting();
// }

// public(package) fun set_status_active(project: &mut Project) {
//     project.status = config::status_active();
// }

// public(package) fun set_status_rejected(project: &mut Project) {
//     project.status = config::status_rejected();
// }
