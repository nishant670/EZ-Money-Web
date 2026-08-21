import assert from "node:assert/strict";
import test from "node:test";
import { planDisplayName } from "./plans";

test("plan API codes are rendered as product-facing names", () => {
    assert.equal(planDisplayName("paid"), "a paid Finnri plan");
    assert.equal(planDisplayName("free"), "Finnri Free");
    assert.equal(planDisplayName("pro_plus"), "Finnri Pro Plus");
    assert.equal(planDisplayName("  "), "an upgraded Finnri plan");
});
