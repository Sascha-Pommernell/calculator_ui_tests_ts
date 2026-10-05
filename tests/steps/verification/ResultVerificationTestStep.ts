import type { CalculationTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies the result panel (exact result literal and expression line)
 */
export class ResultVerificationTestStep extends BaseTestStep<CalculationTestData> {
    async execute(): Promise<void> {
        const { result, expression } = this.testData.expected;

        await this.executeStep("Verifikation des Ergebnisses", async () => {
            const resultPanel = this.pages.calculatorPage.getResultPanel;

            const resultInfo = await this.assertionReporter.expectText(
                resultPanel.getResultValue(),
                result,
                "Exaktes Ergebnis",
                "Ergebnis-Panel",
            );
            this.addAssertion(resultInfo);

            const expressionInfo = await this.assertionReporter.expectText(
                resultPanel.getExpression(),
                expression,
                "Rechenausdruck",
                "Ergebnis-Panel",
            );
            this.addAssertion(expressionInfo);

            const noErrorInfo = await this.assertionReporter.expectHidden(
                resultPanel.getErrorAlert(),
                "Fehlermeldung",
                "Ergebnis-Panel",
            );
            this.addAssertion(noErrorInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
