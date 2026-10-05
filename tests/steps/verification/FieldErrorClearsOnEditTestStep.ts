import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: submits an invalid first operand, verifies the field error and checks
 * that the error disappears as soon as the user edits the field
 */
export class FieldErrorClearsOnEditTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const calculation = this.testData.calculations?.[0];
        if (!calculation) throw new Error("Szenario benötigt eine Berechnung in testData.calculations");

        const expected = this.testData.expected ?? {};
        const setForm = this.pages.calculatorPage.setCalculatorForm;
        const getForm = this.pages.calculatorPage.getCalculatorForm;

        await this.executeStep("Ungültigen Operanden absenden", async () => {
            await setForm.submitCalculation(calculation.operation, calculation.operands);

            const errorInfo = await this.assertionReporter.expectText(
                getForm.getOperandError(1),
                expected.fieldError ?? "Ungültige Zahl",
                "Fehlertext Zahl 1",
                "Vor Bearbeitung",
            );
            this.addAssertion(errorInfo);
        });

        await this.executeStep("Feld bearbeiten – Fehler verschwindet", async () => {
            await setForm.typeIntoOperand(1, expected.operandAfterEdit ?? "1");

            const hiddenInfo = await this.assertionReporter.expectHidden(
                getForm.getOperandError(1),
                "Fehlertext Zahl 1",
                "Nach Bearbeitung",
            );
            this.addAssertion(hiddenInfo);

            const ariaInfo = await this.assertionReporter.expectEqual(
                await getForm.getAriaInvalid(getForm.getOperandInput(1)),
                null,
                "aria-invalid Zahl 1",
                "Nach Bearbeitung",
            );
            this.addAssertion(ariaInfo);
        });
    }
}
