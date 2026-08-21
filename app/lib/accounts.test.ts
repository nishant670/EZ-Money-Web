import assert from "node:assert/strict";
import test from "node:test";
import { ACCOUNT_PAYMENT_MODES, ACCOUNT_TYPES, PAYMENT_MODES, creditCardPosition, paymentModeForAccountType, resolvePaymentMode } from "./accounts";

test("every account type has an explicit payment-mode decision", () => {
    assert.deepEqual(Object.keys(ACCOUNT_PAYMENT_MODES), ACCOUNT_TYPES.map((account) => account.value));
    assert.equal(paymentModeForAccountType("bank"), "Bank Account");
    assert.equal(paymentModeForAccountType("debit_card"), "Bank Account");
    assert.equal(paymentModeForAccountType("credit_card"), "Credit Card");
    assert.equal(paymentModeForAccountType("other"), null);
});

test("payment mode parsing accepts only the canonical vocabulary", () => {
    for (const mode of PAYMENT_MODES) assert.equal(resolvePaymentMode(` ${mode.toLowerCase()} `), mode);
    assert.equal(resolvePaymentMode("Debit Card"), null);
    assert.equal(resolvePaymentMode(""), null);
});

test("credit-card positions distinguish debt from an overpayment", () => {
    assert.deepEqual(creditCardPosition(13512), { label: "Outstanding", displayAmount: 13512, owedAmount: 13512 });
    assert.deepEqual(creditCardPosition(-13512), { label: "In credit", displayAmount: 13512, owedAmount: 0 });
    assert.deepEqual(creditCardPosition(undefined), { label: "Outstanding", displayAmount: 0, owedAmount: 0 });
});
