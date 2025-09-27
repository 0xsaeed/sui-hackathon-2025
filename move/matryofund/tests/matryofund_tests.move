#[allow(unused_use)]
#[test_only]
module matryofund::matryofund_tests;

use matryofund::matryofund;

const ENotImplemented: u64 = 0;

#[test]
fun test_matryofund() {}

#[test, expected_failure(abort_code = ::matryofund::matryofund_tests::ENotImplemented)]
fun test_matryofund_fail() {
    abort ENotImplemented
}
