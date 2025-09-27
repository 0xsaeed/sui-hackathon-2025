// #[allow(unused_const, unused_use)]

module matryofund::config;

const COMMISSION_FEE_RATE: u8 = 1; // 1% fee on profits
const COMMISSION_FEE_BENEFICIARY: address = @0x100; // Address to receive commission fees
const VOTING_PERIOD: u64 = 2 * 24 * 60 * 60; // 2 days in seconds
const VOTING_PERIOD_EXTEND: u64 = 24 * 60 * 60; // 1 day extension if a vote is cast near the end of the voting period
const MINIMUM_QUORUM: u64 = 1; // minimum number of votes required for a proposal to be valid
const MINIMUM_ACCEPTANCE_RATE: u8 = 51; // minimum percentage for a proposal to be accepted

// Project statuses
const STATUS_FUNDING: u8 = 0; // funding status
const STATUS_FAILED: u8 = 1; // failed status
const STATUS_ACTIVE: u8 = 2; // active status
const STATUS_VOTING: u8 = 3; // voting status
const STATUS_REJECTED: u8 = 4; // rejected status
const STATUS_CLOSED: u8 = 5; // closed status

public fun commission_fee_rate(): u8 { COMMISSION_FEE_RATE }

public fun commission_fee_beneficiary(): address { COMMISSION_FEE_BENEFICIARY }

public fun voting_period(): u64 { VOTING_PERIOD }

public fun voting_period_extend(): u64 { VOTING_PERIOD_EXTEND }

public fun minimum_quorum(): u64 { MINIMUM_QUORUM }

public fun minimum_acceptance_rate(): u8 { MINIMUM_ACCEPTANCE_RATE }

public fun status_funding(): u8 { STATUS_FUNDING }

public fun status_failed(): u8 { STATUS_FAILED }

public fun status_active(): u8 { STATUS_ACTIVE }

public fun status_voting(): u8 { STATUS_VOTING }

public fun status_rejected(): u8 { STATUS_REJECTED }

public fun status_closed(): u8 { STATUS_CLOSED }
