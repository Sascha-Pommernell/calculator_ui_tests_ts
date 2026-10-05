import type { Locator, Page } from "@playwright/test";
import type { ClientValidationTestData, FieldExpectation, Pages } from "../../../types.js";
import type { ApiRouteManager } from "../../../utils/networkManager/ApiRouteManager.js";
import type { AssertionReporter } from "../../../utils/report/AssertionReporter.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies client-side field validation for every operand field –
 * error texts, aria-invalid, idle result panel and that no API request was sent
 */
export class FieldErrorVerificationTestStep extends BaseTestStep<ClientValidationTestData> {
    constructor(
        page: Page,
        pages: Pages,
        testData: ClientValidationTestData,
        assertionReporter: AssertionReporter,
        private readonly routeManager: ApiRouteManager,
    ) {
        super(page, pages, testData, assertionReporter);
    }

    async execute(): Promise<void> {
        const { fields, idleHint } = this.testData.expected;
        const form = this.pages.calculatorPage.getCalculatorForm;

        await this.executeStep("Verifikation der Feldfehler", async () => {
            for (const [index, expectation] of fields.entries()) {
                const position = index + 1;
                await this.verifyField(form.getOperandInput(position), expectation, `Zahl ${position}`);
            }
        });

        await this.executeStep("Verifikation: keine Berechnung ausgelöst", async () => {
            const hintInfo = await this.assertionReporter.expectText(
                this.pages.calculatorPage.getResultPanel.getHint(),
                idleHint,
                "Hinweistext im Ergebnis-Panel (idle)",
                "Client-Validierung",
            );
            this.addAssertion(hintInfo);

            const noResultInfo = await this.assertionReporter.expectHidden(
                this.pages.calculatorPage.getResultPanel.getResultValue(),
                "Ergebniswert",
                "Client-Validierung",
            );
            this.addAssertion(noResultInfo);

            const requestInfo = await this.assertionReporter.expectEqual(
                this.routeManager.getRecordedRequestCount(),
                0,
                "Anzahl der API-Requests an /api/calculate",
                "Client-Validierung verhindert API-Aufruf",
            );
            this.addAssertion(requestInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }

    private async verifyField(input: Locator, expectation: FieldExpectation, fieldName: string): Promise<void> {
        const form = this.pages.calculatorPage.getCalculatorForm;

        if (expectation.error === null) {
            const noErrorInfo = await this.assertionReporter.expectHidden(
                form.getFieldError(input),
                `Fehlertext ${fieldName}`,
                "Feld ohne Fehler",
            );
            this.addAssertion(noErrorInfo);

            const ariaInfo = await this.assertionReporter.expectEqual(
                await form.getAriaInvalid(input),
                null,
                `aria-invalid ${fieldName}`,
                "Feld ohne Fehler",
            );
            this.addAssertion(ariaInfo);
            return;
        }

        const errorInfo = await this.assertionReporter.expectText(
            form.getFieldError(input),
            expectation.error,
            `Fehlertext ${fieldName}`,
            "Feld mit Fehler",
        );
        this.addAssertion(errorInfo);

        const ariaInfo = await this.assertionReporter.expectEqual(
            await form.getAriaInvalid(input),
            "true",
            `aria-invalid ${fieldName}`,
            "Feld mit Fehler",
        );
        this.addAssertion(ariaInfo);
    }
}
