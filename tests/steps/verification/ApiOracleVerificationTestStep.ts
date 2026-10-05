import type { Page } from "@playwright/test";
import { CalculatorService } from "../../../api/service/calculatorService/CalculatorService.js";
import type { CalculationTestData, Pages } from "../../../types.js";
import type { AssertionReporter } from "../../../utils/report/AssertionReporter.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * Parses an operand exactly like the UI does (trim, comma as decimal separator)
 */
export function parseOperandLikeUi(raw: string): number {
    return Number(raw.trim().replace(",", "."));
}

/**
 * TestStep: cross-checks the UI result against the API (oracle) –
 * the UI must render exactly the literal the API returns.
 */
export class ApiOracleVerificationTestStep extends BaseTestStep<CalculationTestData> {
    private readonly calculatorService: CalculatorService;

    constructor(
        page: Page,
        pages: Pages,
        testData: CalculationTestData,
        assertionReporter: AssertionReporter,
        calculatorService?: CalculatorService,
    ) {
        super(page, pages, testData, assertionReporter);
        this.calculatorService = calculatorService ?? new CalculatorService();
    }

    async execute(): Promise<void> {
        const { operation, operands } = this.testData.calculation;

        await this.executeStep("Abgleich des UI-Ergebnisses mit der API (Orakel)", async () => {
            try {
                const apiResult = await this.calculatorService.calculate(operation, operands.map(parseOperandLikeUi));

                const statusInfo = await this.assertionReporter.expectEqual(
                    apiResult.status,
                    200,
                    "HTTP-Status der API",
                    "API-Orakel",
                );
                this.addAssertion(statusInfo);

                const uiResult = await this.pages.calculatorPage.getResultPanel.getResultValueText();
                const oracleInfo = await this.assertionReporter.expectEqual(
                    uiResult,
                    apiResult.resultLiteral ?? "",
                    "UI-Ergebnis entspricht API-Ergebnis",
                    "API-Orakel",
                );
                this.addAssertion(oracleInfo);
            } finally {
                await this.calculatorService.dispose();
            }
        });
    }
}
