import type { BaseTestData, CalculationInput } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: ensures the right number of operand fields and enters all operands
 */
export class EnterOperandsTestStep<
    TData extends BaseTestData & { calculation: CalculationInput },
> extends BaseTestStep<TData> {
    async execute(): Promise<void> {
        const { operands } = this.testData.calculation;

        await this.executeStep(`Operanden eingeben (${operands.map((o) => `"${o}"`).join(", ")})`, async () => {
            const setForm = this.pages.calculatorPage.setCalculatorForm;
            const getForm = this.pages.calculatorPage.getCalculatorForm;

            await setForm.fillOperands(operands);

            const countInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandCount(),
                operands.length,
                "Anzahl der Eingabefelder",
                "Operanden eingeben",
            );
            this.addAssertion(countInfo);

            const valuesInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandValues(),
                operands,
                "Eingabewerte aller Felder",
                "Operanden eingeben",
            );
            this.addAssertion(valuesInfo);
        });
    }
}
