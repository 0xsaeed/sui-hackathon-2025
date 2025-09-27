module matryofund::project{
        use sui::clock::Clock;
        use std::string::String;
        use sui::event;

    public struct Project has key {
        id: UID,
        title: String,
        description: String,
        link: String,              // social link (e.g. twitter/website)
        min_funding: u64,          // in MIST
        deadline: u64,             // ms timestamp = now + duration_ms
        hardcap: u64,              // in MIST
        milestones: vector<u8>,    // must sum to 100
        creator: address,
        raised: u64,               // total contributed (MIST)
        milestone_index: u8,         // next milestone to open/finalize
        status: u8,              // false when canceled or fully completed
    }

    /// Create a new project and SHARE it.
    public fun create_project(
        title: String,
        description: String,
        link: String,
        min_funding: u64,
        duration_ms: u64,
        hardcap: u64,
        milestones: vector<u8>,
        clk: &Clock,
        ctx: &mut TxContext
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
            current_index: 0,
            active: 1,
        };

        // Share the project object
        transfer::share_object(project);
    }
}