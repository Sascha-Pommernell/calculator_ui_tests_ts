import type { CalculationInput, UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: performs several calculations in sequence and waits for each result
 * (used for history scenarios)
 */
export class PerformCalculationsTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const calculations: CalculationInput[] = this.testData.calculations ?? [];
        const expectedResults = this.testData.expected?.results ?? [];

        for (const [index, calculation] of calculations.entries()) {
            const { operation, operands } = calculation;

            await this.executeStep(
                `Berechnung ${index + 1}/${calculations.length}: ${operation}(${operands.join(", ")})`,
                async () => {
                    await this.pages.calculatorPage.setCalculatorForm.submitCalculation(operation, operands);

                    const expectedResult = expectedResults[index];
                    if (expectedResult !== undefined) {
                        const resultInfo = await this.assertionReporter.expectText(
                            this.pages.calculatorPage.getResultPanel.getResultValue(),
                            expectedResult,
                            "Ergebnis der Berechnung",
                            `Berechnung ${index + 1}`,
                        );
                        this.addAssertion(resultInfo);
                    } else {
                        const visibleInfo = await this.assertionReporter.expectVisible(
                            this.pages.calculatorPage.getResultPanel.getResultValue(),
                            "Ergebnis der Berechnung",
                            `Berechnung ${index + 1}`,
                        );
                        this.addAssertion(visibleInfo);
                    }
                },
            );
        }
    }
}
