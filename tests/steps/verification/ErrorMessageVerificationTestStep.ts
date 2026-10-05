import type { BaseTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies an error message in the result panel
 * (API error contract or network error) and that no result/history is shown
 */
export class ErrorMessageVerificationTestStep<TData extends BaseTestData = BaseTestData> extends BaseTestStep<TData> {
    /**
     * @param expectedMessage - Expected text of the error alert
     */
    async execute(expectedMessage: string): Promise<void> {
        await this.executeStep("Verifikation der Fehlermeldung", async () => {
            const resultPanel = this.pages.calculatorPage.getResultPanel;

            const messageInfo = await this.assertionReporter.expectText(
                resultPanel.getErrorAlert(),
                expectedMessage,
                "Fehlermeldung im Ergebnis-Panel",
                "Fehlerfall",
            );
            this.addAssertion(messageInfo);

            const noResultInfo = await this.assertionReporter.expectHidden(
                resultPanel.getResultValue(),
                "Ergebniswert",
                "Fehlerfall",
            );
            this.addAssertion(noResultInfo);

            const noHistoryInfo = await this.assertionReporter.expectHidden(
                this.pages.calculatorPage.getHistory.getSection(),
                "Verlaufs-Bereich",
                "Fehlerfall – fehlgeschlagene Berechnungen landen nicht im Verlauf",
            );
            this.addAssertion(noHistoryInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
