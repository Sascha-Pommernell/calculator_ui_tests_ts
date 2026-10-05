import { MIN_OPERANDS } from "../../../types.js";
import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: adds operand fields, verifies focus/remove buttons, removes a field in the middle
 * and checks that the remaining values are preserved and the minimum cannot be undercut
 */
export class OperandFieldsTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const config = this.testData.operandFields;
        if (!config) throw new Error("Szenario benötigt testData.operandFields");

        const setForm = this.pages.calculatorPage.setCalculatorForm;
        const getForm = this.pages.calculatorPage.getCalculatorForm;
        const expect = this.pages.calculatorPage.expect;
        const expectedCount = MIN_OPERANDS + config.add;

        await this.executeStep(`${config.add} Eingabefeld(er) über "Zahl hinzufügen" ergänzen`, async () => {
            for (let i = 0; i < config.add; i++) {
                await setForm.clickAddOperand();
            }
            await expect(getForm.getOperandInputs()).toHaveCount(expectedCount);

            const countInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandCount(),
                expectedCount,
                "Anzahl Eingabefelder nach Hinzufügen",
                "Operandenfelder",
            );
            this.addAssertion(countInfo);

            await expect(getForm.getOperandInput(expectedCount)).toBeFocused();
            const focusInfo = await this.assertionReporter.expectEqual(
                await getForm.isFocused(getForm.getOperandInput(expectedCount)),
                true,
                "Fokus liegt auf dem neu hinzugefügten Feld",
                "Operandenfelder",
            );
            this.addAssertion(focusInfo);

            const removeButtonsInfo = await this.assertionReporter.expectEqual(
                await getForm.getRemoveOperandButtons().count(),
                expectedCount,
                "Jedes Feld hat einen Entfernen-Button (mehr als Minimum)",
                "Operandenfelder",
            );
            this.addAssertion(removeButtonsInfo);
        });

        await this.executeStep("Werte eingeben und mittleres Feld entfernen", async () => {
            for (const [index, value] of config.values.entries()) {
                await setForm.fillOperand(index + 1, value);
            }

            await setForm.clickRemoveOperand(config.removePosition);
            await expect(getForm.getOperandInputs()).toHaveCount(config.valuesAfterRemove.length);

            const valuesInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandValues(),
                config.valuesAfterRemove,
                "Verbleibende Werte nach Entfernen (keine Verschiebung)",
                "Operandenfelder",
            );
            this.addAssertion(valuesInfo);
        });

        await this.executeStep("Minimum von zwei Feldern kann nicht unterschritten werden", async () => {
            await setForm.ensureOperandCount(MIN_OPERANDS);

            const countInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandCount(),
                MIN_OPERANDS,
                "Anzahl Eingabefelder am Minimum",
                "Operandenfelder",
            );
            this.addAssertion(countInfo);

            const noRemoveInfo = await this.assertionReporter.expectHidden(
                getForm.getRemoveOperandButtons(),
                "Entfernen-Buttons",
                "Am Minimum nicht vorhanden",
            );
            this.addAssertion(noRemoveInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
