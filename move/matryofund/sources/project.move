#[allow(unused_field, unused_variable)]
module matryofund::project;

use matryofund::config;
use std::string::String;
use sui::clock::Clock;

public struct Project has key {
    id: UID,
    creator: address,
    title: String,
    description: String,
    link: String, // todo url
    funding_start: u64,
    funding_deadline: u64,
    funding_goal: u128,
    total_raised: u128, // total contributed (MIST)
    total_withdrawn_percentage: u8, // total withdrawn by creator (%)
    close_on_funding_goal: bool, // auto-close funding when goal is reached
    milestones: vector<Milestone>, // must sum to 100
    milestone_index: u8, // next milestone to open/finalize
    status: u8, // false when canceled or fully completed
}

public struct Milestone has store {
    title: String,
    deadline: u64,
    is_claimed: bool,
    release_percentage: u8,
}

/// Create a new project and SHARE it.
public fun create_project(
    title: String,
    description: String,
    link: String,
    funding_deadline: u64,
    funding_goal: u128,
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
    assert!(n == vector::length(&milestone_deadlines), 2);
    assert!(n == vector::length(&milestone_percents), 3);
    let mut i = 0;
    while (i < n) {
        let ms = Milestone {
            title: milestone_titles[i],
            deadline: milestone_deadlines[i],
            is_claimed: false,
            release_percentage: milestone_percents[i],
        };
        vector::push_back(&mut milestones, ms);
        i = i + 1;
    };

    let project = Project {
        id: sui::object::new(ctx),
        creator: tx_context::sender(ctx),
        title,
        description,
        link,
        funding_start: now,
        funding_deadline,
        funding_goal,
        total_raised: 0u128,
        total_withdrawn_percentage: 0u8,
        close_on_funding_goal,
        milestones,
        milestone_index: 0u8,
        status: config::status_funding(),
    };

    // Share the project object
    transfer::share_object(project);
}

/// Create a new milestone object
public fun new_milestone(
    title: String,
    deadline: u64,
    release_percentage: u8,
    ctx: &mut TxContext,
): Milestone {
    Milestone {
        title,
        deadline,
        is_claimed: false,
        release_percentage,
    }
}

public fun finish_funding(project: &mut Project, clk: &Clock) {
    let now = sui::clock::timestamp_ms(clk);
    assert!(now >= project.funding_deadline, 0);
    if (project.total_raised >= project.funding_goal) {
        // Successful funding
        project.status = 2; // active
    } else {
        // Failed funding
        project.status = config::status_failed();
    }
}
