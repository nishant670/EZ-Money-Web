import assert from "node:assert/strict";
import test from "node:test";
import { notificationDestination } from "./notifications";

test("entry notifications retain the exact entry id", () => {
    assert.equal(notificationDestination("/entry/42"), "/dashboard/transactions?entry_id=42");
});

test("current backend notification paths reach their nearest web destination", () => {
    assert.equal(notificationDestination("/subscriptions"), "/dashboard/tools#subscriptions");
    assert.equal(notificationDestination("/subscription-occurrences/9"), "/dashboard/tools#subscriptions");
    assert.equal(notificationDestination("/accounts/4"), "/dashboard/accounts");
    assert.equal(notificationDestination("/split/groups/3"), "/dashboard/splits");
    assert.equal(notificationDestination("/invite/split/token_1"), "/dashboard/splits");
});

test("monthly reviews preserve the complete calendar month", () => {
    assert.equal(notificationDestination("/monthly-review/2028-02"), "/dashboard/reports?range=custom&start_date=2028-02-01&end_date=2028-02-29");
});

test("unknown actions fail safely to Overview and absent actions stay inert", () => {
    assert.equal(notificationDestination("/future/mobile-only"), "/dashboard");
    assert.equal(notificationDestination(), null);
});
