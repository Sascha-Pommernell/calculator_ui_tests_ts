import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies the pending state while a (delayed) calculation is running
 * and the restored idle state afterwards
 */
export class PendingStateVerificationTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const calculation = this.testData.calculations?.[0];
        if (!calculation) throw new Error("Szenario benötigt eine Berechnung in testData.calculations");

        const expected = this.testData.expected ?? {};
        const pendingText = expected.pendingButtonText ?? "Berechne…";
        const idleText = expected.idleButtonText ?? "Berechnen";
        const expectedResult = expected.results?.[0];

        const setForm = this.pages.calculatorPage.setCalculatorForm;
        const isDisabled = this.pages.calculatorPage.isCalculatorFormDisabled;
        const expect = this.pages.calculatorPage.expect;

        await this.executeStep("Berechnung absenden und Pending-Zustand prüfen", async () => {
            await setForm.fillOperands(calculation.operands);
            await setForm.selectOperation(calculation.operation);
            await setForm.clickSubmit();

            await expect(isDisabled.getSubmitButton()).toHaveText(pendingText);
            const buttonTextInfo = await this.assertionReporter.expectEqual(
                await this.pages.calculatorPage.getCalculatorForm.getSubmitButtonText(),
                pendingText,
                "Button-Text während Berechnung",
                "Pending",
            );
            this.addAssertion(buttonTextInfo);

            await expect(isDisabled.getSubmitButton()).toBeDisabled();
            await expect(isDisabled.getOperandInput(1)).toBeDisabled();
            await expect(isDisabled.getOperandInput(2)).toBeDisabled();
            await expect(isDisabled.getAddOperandButton()).toBeDisabled();
            await expect(isDisabled.getOperationRadios().first()).toBeDisabled();

            const disabledInfo = await this.assertionReporter.expectEqual(
                {
                    submit: await isDisabled.isSubmitButtonDisabled(),
                    operands: await isDisabled.areAllOperandsDisabled(),
                    addOperand: await isDisabled.isAddOperandButtonDisabled(),
                    operationGroup: await isDisabled.isOperationGroupDisabled(),
                    formBusy: await isDisabled.isFormBusy(),
                },
                { submit: true, operands: true, addOperand: true, operationGroup: true, formBusy: true },
                "Formular-Steuerelemente deaktiviert",
                "Pending",
            );
            this.addAssertion(disabledInfo);

            const hintInfo = await this.assertionReporter.expectVisible(
                this.pages.calculatorPage.getResultPanel.getHint(),
                "Hinweis 'Berechnung läuft…'",
                "Pending",
            );
            this.addAssertion(hintInfo);
        });

        await this.executeStep("Nach Abschluss: Formular wieder aktiv und Ergebnis sichtbar", async () => {
            await expect(isDisabled.getSubmitButton()).toHaveText(idleText);
            await expect(isDisabled.getSubmitButton()).toBeEnabled();
            await expect(isDisabled.getOperandInput(1)).toBeEnabled();

            const enabledInfo = await this.assertionReporter.expectEqual(
                {
                    submit: await isDisabled.isSubmitButtonDisabled(),
                    operand1: await isDisabled.isOperandDisabled(1),
                    addOperand: await isDisabled.isAddOperandButtonDisabled(),
                    formBusy: await isDisabled.isFormBusy(),
                },
                { submit: false, operand1: false, addOperand: false, formBusy: false },
                "Formular-Steuerelemente wieder aktiv",
                "Nach Berechnung",
            );
            this.addAssertion(enabledInfo);

            if (expectedResult !== undefined) {
                const resultInfo = await this.assertionReporter.expectText(
                    this.pages.calculatorPage.getResultPanel.getResultValue(),
                    expectedResult,
                    "Ergebnis nach verzögerter Antwort",
                    "Nach Berechnung",
                );
                this.addAssertion(resultInfo);
            }

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
