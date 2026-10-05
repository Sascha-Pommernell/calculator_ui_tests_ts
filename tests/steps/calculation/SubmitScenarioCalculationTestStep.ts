import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: submits the first calculation of a scenario without waiting for a result
 * (used when the request is expected to fail, e.g. network or gateway errors)
 */
export class SubmitScenarioCalculationTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const calculation = this.testData.calculations?.[0];
        if (!calculation) throw new Error("Szenario benötigt eine Berechnung in testData.calculations");

        const { operation, operands } = calculation;
        await this.executeStep(`Berechnung absenden: ${operation}(${operands.join(", ")})`, async () => {
            await this.pages.calculatorPage.setCalculatorForm.submitCalculation(operation, operands);
            this.reportProgress("Berechnung abgesendet (Antwort wird als Fehler erwartet)");
        });
    }
}
