import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { ApiErrorTestData } from "../types.js";
import { PageObjectFactory } from "../utils/pageObjectModel/PageObjectFactory.js";
import { AssertionReporter } from "../utils/report/AssertionReporter.js";
import { TestCaseRunner } from "../utils/testFramework/TestCaseRunner.js";
import {
    EnterOperandsTestStep,
    ErrorMessageVerificationTestStep,
    OpenCalculatorPageTestStep,
    SelectOperationTestStep,
    SubmitCalculationTestStep,
} from "./steps/index.js";

// Load test data once at module level with environment-specific configuration
const testDataConfig = {
    baseName: "apiError",
    subDirectory: "apiErrorTestData",
    devFile: "apiError_Dev.json",
    stagingFile: "apiError_Staging.json",
};
const testCaseRunner = new TestCaseRunner<ApiErrorTestData>(testDataConfig);
const testCases = testCaseRunner.getAvailableTestCases();

test.describe("4.2/4.3/4.4 API-Fehler in der UI – Überlauf, Division durch null, Wertebereich", () => {
    /**
     * Executes the complete workflow for a given test case
     */
    const executeCompleteWorkflow = async (page: Page, testCaseName: string): Promise<void> => {
        console.log(`Running test case: ${testCaseName}`);

        const runner = new TestCaseRunner<ApiErrorTestData>(testDataConfig);
        const processedTestData = runner.setupTestCase(testCaseName);

        const pageFactory = new PageObjectFactory(page, expect);
        const pages = pageFactory.getAllPages();
        const assertionReporter = new AssertionReporter(test);

        const openCalculatorPageStep = new OpenCalculatorPageTestStep(page, pages, processedTestData, assertionReporter);
        const enterOperandsStep = new EnterOperandsTestStep(page, pages, processedTestData, assertionReporter);
        const selectOperationStep = new SelectOperationTestStep(page, pages, processedTestData, assertionReporter);
        const submitCalculationStep = new SubmitCalculationTestStep(page, pages, processedTestData, assertionReporter);
        const errorMessageVerificationStep = new ErrorMessageVerificationTestStep(
            page,
            pages,
            processedTestData,
            assertionReporter,
        );

        try {
            await openCalculatorPageStep.execute();
            await enterOperandsStep.execute();
            await selectOperationStep.execute();
            await submitCalculationStep.execute();
            await errorMessageVerificationStep.execute(processedTestData.expected.errorMessage);

            console.log(`Test case "${testCaseName}" completed successfully`);
        } catch (error) {
            console.error(`Test case "${testCaseName}" failed:`, error instanceof Error ? error.message : String(error));
            throw error;
        }
    };

    for (const testCaseName of testCases) {
        test(`${testCaseName} - Fehlermeldung`, { tag: testCaseRunner.getTags(testCaseName) }, async ({ page }) => {
            await executeCompleteWorkflow(page, testCaseName);
        });
    }
});
