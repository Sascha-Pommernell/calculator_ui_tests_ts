import type { BaseTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: opens the calculator page and verifies the page heading
 */
export class OpenCalculatorPageTestStep<TData extends BaseTestData = BaseTestData> extends BaseTestStep<TData> {
    async execute(): Promise<void> {
        await this.executeStep("Rechner-Seite öffnen", async () => {
            const url = this.testData.urls.baseUrl + this.testData.urls.calculatorPath;
            await this.pages.calculatorPage.goto(url);

            const headingInfo = await this.assertionReporter.expectVisible(
                this.pages.calculatorPage.getHeading(),
                "Seitenüberschrift",
                "Rechner-Seite ist geladen",
            );
            this.addAssertion(headingInfo);
            this.reportProgress(`Rechner-Seite geöffnet: ${url}`);
        });
    }
}
