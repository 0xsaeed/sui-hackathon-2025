#[allow(unused_field, unused_variable)]
module matryofund::project;

use std::string::String;
use sui::clock::Clock;

public struct Project has key {
    id: UID,
    title: String,
    description: String,
    link: String, // social link (e.g. twitter/website)
    min_funding: u64, // in MIST
    deadline: u64, // ms timestamp = now + duration_ms
    hardcap: u64, // in MIST
    milestones: vector<Milestone>, // must sum to 100
    creator: address,
    raised: u64, // total contributed (MIST)
    milestone_index: u8, // next milestone to open/finalize
    status: u8, // false when canceled or fully completed
}

public struct Milestone has key, store {
    id: UID,
    title: String,
    deadline: u64,
    claimed_status: bool,
    release_percentage: u8,
}

/// Create a new project and SHARE it.
public fun create_project(
    title: String,
    description: String,
    link: String,
    min_funding: u64,
    duration_ms: u64,
    hardcap: u64,
    milestones: vector<Milestone>,
    clk: &Clock,
    ctx: &mut TxContext,
) {
    let now = sui::clock::timestamp_ms(clk);
    let deadline = now + duration_ms;
    let project = Project {
        id: sui::object::new(ctx),
        title,
        description,
        link,
        min_funding,
        deadline,
        hardcap,
        milestones,
        creator: sui::tx_context::sender(ctx),
        raised: 0,
        milestone_index: 0,
        status: 1,
    };

    // Share the project object
    transfer::share_object(project);
}
