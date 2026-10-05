import type { BaseTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: submits the calculator form ("Berechnen")
 */
export class SubmitCalculationTestStep<TData extends BaseTestData = BaseTestData> extends BaseTestStep<TData> {
    async execute(): Promise<void> {
        await this.executeStep('Berechnung über "Berechnen" absenden', async () => {
            await this.pages.calculatorPage.setCalculatorForm.clickSubmit();
            this.reportProgress("Berechnung abgesendet");
        });
    }
}
