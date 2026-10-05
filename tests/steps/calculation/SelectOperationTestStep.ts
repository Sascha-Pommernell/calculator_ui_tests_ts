import { OPERATION_LABELS } from "../../../types.js";
import type { BaseTestData, CalculationInput } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: selects the arithmetic operation via radio button
 */
export class SelectOperationTestStep<
    TData extends BaseTestData & { calculation: CalculationInput },
> extends BaseTestStep<TData> {
    async execute(): Promise<void> {
        const { operation } = this.testData.calculation;

        await this.executeStep(`Operation "${OPERATION_LABELS[operation]}" auswählen`, async () => {
            await this.pages.calculatorPage.setCalculatorForm.selectOperation(operation);

            const selectedInfo = await this.assertionReporter.expectEqual(
                await this.pages.calculatorPage.getCalculatorForm.getSelectedOperation(),
                operation,
                "Ausgewählte Operation",
                "Operation auswählen",
            );
            this.addAssertion(selectedInfo);
        });
    }
}
