import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { CalculationTestData } from "../types.js";
import { PageObjectFactory } from "../utils/pageObjectModel/PageObjectFactory.js";
import { AssertionReporter } from "../utils/report/AssertionReporter.js";
import { TestCaseRunner } from "../utils/testFramework/TestCaseRunner.js";
import {
    ApiOracleVerificationTestStep,
    EnterOperandsTestStep,
    HistoryVerificationTestStep,
    OpenCalculatorPageTestStep,
    ResultVerificationTestStep,
    SelectOperationTestStep,
    SubmitCalculationTestStep,
} from "./steps/index.js";

// Load test data once at module level with environment-specific configuration
const testDataConfig = {
    baseName: "happyPath",
    subDirectory: "happyPathTestData",
    devFile: "happyPath_Dev.json",
    stagingFile: "happyPath_Staging.json",
};
const testCaseRunner = new TestCaseRunner<CalculationTestData>(testDataConfig);
const testCases = testCaseRunner.getAvailableTestCases();

test.describe("4.1 Happy Path – Grundrechenarten (UI)", () => {
    /**
     * Executes the complete workflow for a given test case
     */
    const executeCompleteWorkflow = async (page: Page, testCaseName: string): Promise<void> => {
        console.log(`Running test case: ${testCaseName}`);

        const runner = new TestCaseRunner<CalculationTestData>(testDataConfig);
        const processedTestData = runner.setupTestCase(testCaseName);

        const pageFactory = new PageObjectFactory(page, expect);
        const pages = pageFactory.getAllPages();
        const assertionReporter = new AssertionReporter(test);

        // Create TestStep instances
        const openCalculatorPageStep = new OpenCalculatorPageTestStep(page, pages, processedTestData, assertionReporter);
        const enterOperandsStep = new EnterOperandsTestStep(page, pages, processedTestData, assertionReporter);
        const selectOperationStep = new SelectOperationTestStep(page, pages, processedTestData, assertionReporter);
        const submitCalculationStep = new SubmitCalculationTestStep(page, pages, processedTestData, assertionReporter);
        const resultVerificationStep = new ResultVerificationTestStep(page, pages, processedTestData, assertionReporter);
        const historyVerificationStep = new HistoryVerificationTestStep(page, pages, processedTestData, assertionReporter);
        const apiOracleVerificationStep = new ApiOracleVerificationTestStep(
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
            await resultVerificationStep.execute();
            await historyVerificationStep.execute([processedTestData.expected.historyEntry]);
            await apiOracleVerificationStep.execute();

            console.log(`Test case "${testCaseName}" completed successfully`);
        } catch (error) {
            console.error(`Test case "${testCaseName}" failed:`, error instanceof Error ? error.message : String(error));
            throw error;
        }
    };

    // Create a separate test for each test case
    for (const testCaseName of testCases) {
        test(`${testCaseName} - Kompletter Workflow`, { tag: testCaseRunner.getTags(testCaseName) }, async ({ page }) => {
            await executeCompleteWorkflow(page, testCaseName);
        });
    }
});
