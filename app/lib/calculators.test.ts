import assert from "node:assert/strict";
import test from "node:test";
import { calculateEMI, calculateSIP, SIP_PRESETS } from "./calculators";

test("EMI matches the backend fixture at paise precision", () => {
    const result = calculateEMI({
        principalAmount: 100000,
        annualInterestRatePercent: 12,
        tenureMonths: 12,
    });

    assert.equal(result.monthlyEMI, 8884.88);
    assert.equal(result.totalPayment, 106618.53);
    assert.equal(result.totalInterest, 6618.53);
    assert.equal(result.schedule.length, 12);
    assert.deepEqual(result.schedule[0], {
        month: 1,
        openingBalance: 100000,
        paymentAmount: 8884.88,
        principalAmount: 7884.88,
        interestAmount: 1000,
        closingBalance: 92115.12,
    });
    assert.equal(result.schedule.at(-1)?.closingBalance, 0);
});

test("zero-interest EMI pays exactly the principal", () => {
    const result = calculateEMI({ principalAmount: 12000, annualInterestRatePercent: 0, tenureMonths: 12 });
    assert.equal(result.monthlyEMI, 1000);
    assert.equal(result.totalPayment, 12000);
    assert.equal(result.totalInterest, 0);
});

test("the shared SIP preset produces a stable projection", () => {
    const result = calculateSIP(SIP_PRESETS[0]);
    assert.equal(result.breakdown.length, 10);
    assert.equal(Math.round(result.investedAmount), 1912491);
    assert.equal(Math.round(result.maturityValue), 3340917);
});
