import assert from "node:assert/strict";
import test from "node:test";
import { joinedGroupPath, readJoinedGroupID, withoutJoinedGroup } from "./split-invite";

test("a join lands on the Groups section carrying the group id", () => {
    assert.equal(joinedGroupPath(42), "/dashboard/splits?joined=42#groups");
});

test("a join without a usable group id still lands on Groups, not Balances", () => {
    for (const id of [null, undefined, 0, -3, 1.5, Number.NaN]) {
        assert.equal(joinedGroupPath(id), "/dashboard/splits#groups");
    }
});

test("the joined id round-trips through the landing URL", () => {
    const search = new URL(joinedGroupPath(42), "https://finnri.app").search;
    assert.equal(readJoinedGroupID(search), 42);
});

test("a missing or malformed joined param is no join", () => {
    for (const search of ["", "?", "?joined=", "?joined=abc", "?joined=0", "?joined=-1", "?joined=1.5", "?joined=1e3", "?other=5"]) {
        assert.equal(readJoinedGroupID(search), null, search);
    }
});

test("clearing the joined param keeps every other param", () => {
    assert.equal(withoutJoinedGroup("?joined=42"), "");
    assert.equal(withoutJoinedGroup("?a=1&joined=42&b=2"), "?a=1&b=2");
    assert.equal(withoutJoinedGroup(""), "");
});
