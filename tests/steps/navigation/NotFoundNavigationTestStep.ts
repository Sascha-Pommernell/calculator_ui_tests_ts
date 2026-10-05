import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: navigates to an unknown route, verifies the "not found" page and returns via the back link
 */
export class NotFoundNavigationTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const expected = this.testData.expected ?? {};
        const unknownPath = expected.unknownPath ?? "/unbekannt";

        await this.executeStep("Unbekannte Route öffnen", async () => {
            await this.pages.notFoundPage.goto(this.testData.urls.baseUrl + unknownPath);

            const headingInfo = await this.assertionReporter.expectText(
                this.pages.notFoundPage.getHeading(),
                expected.notFoundHeading ?? "Seite nicht gefunden",
                "Überschrift der Fehlerseite",
                "Unbekannte Route",
            );
            this.addAssertion(headingInfo);

            const linkInfo = await this.assertionReporter.expectText(
                this.pages.notFoundPage.getBackLink(),
                expected.backLinkText ?? "Zurück zum Rechner",
                "Rücklink zum Rechner",
                "Unbekannte Route",
            );
            this.addAssertion(linkInfo);
        });

        await this.executeStep("Über Rücklink zum Rechner navigieren", async () => {
            await this.pages.notFoundPage.clickBackLink();

            const urlInfo = await this.assertionReporter.expectUrl(
                this.page,
                this.testData.urls.baseUrl + this.testData.urls.calculatorPath,
                "URL nach Rücklink",
                "Zurück zum Rechner",
            );
            this.addAssertion(urlInfo);

            const headingInfo = await this.assertionReporter.expectVisible(
                this.pages.calculatorPage.getHeading(),
                "Rechner-Überschrift",
                "Zurück zum Rechner",
            );
            this.addAssertion(headingInfo);

            const formInfo = await this.assertionReporter.expectVisible(
                this.pages.calculatorPage.setCalculatorForm.getOperandInput(1),
                "Eingabefeld Zahl 1",
                "Zurück zum Rechner",
            );
            this.addAssertion(formInfo);
        });
    }
}
