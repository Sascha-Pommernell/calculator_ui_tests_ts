import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies the API status indicator in the header (text + data-status)
 */
export class ApiStatusVerificationTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const apiStatus = this.testData.apiStatus;
        if (!apiStatus) throw new Error("Szenario benötigt testData.apiStatus");

        await this.executeStep("Verifikation des API-Status", async () => {
            const status = this.pages.calculatorPage.getApiStatus.getStatus();

            const textInfo = await this.assertionReporter.expectText(
                status,
                apiStatus.text,
                "API-Status-Text",
                "Header",
            );
            this.addAssertion(textInfo);

            await this.pages.calculatorPage.expect(status).toHaveAttribute("data-status", apiStatus.dataStatus);
            const dataStatusInfo = await this.assertionReporter.expectEqual(
                await this.pages.calculatorPage.getApiStatus.getDataStatus(),
                apiStatus.dataStatus,
                "API-Status (data-status)",
                "Header",
            );
            this.addAssertion(dataStatusInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
