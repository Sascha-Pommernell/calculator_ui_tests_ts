import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { ClientValidationTestData } from "../types.js";
import { ApiRouteManager } from "../utils/networkManager/ApiRouteManager.js";
import { PageObjectFactory } from "../utils/pageObjectModel/PageObjectFactory.js";
import { AssertionReporter } from "../utils/report/AssertionReporter.js";
import { TestCaseRunner } from "../utils/testFramework/TestCaseRunner.js";
import {
    EnterOperandsTestStep,
    FieldErrorVerificationTestStep,
    OpenCalculatorPageTestStep,
    SelectOperationTestStep,
    SubmitCalculationTestStep,
} from "./steps/index.js";

// Load test data once at module level with environment-specific configuration
const testDataConfig = {
    baseName: "clientValidation",
    subDirectory: "clientValidationTestData",
    devFile: "clientValidation_Dev.json",
    stagingFile: "clientValidation_Staging.json",
};
const testCaseRunner = new TestCaseRunner<ClientValidationTestData>(testDataConfig);
const testCases = testCaseRunner.getAvailableTestCases();

const isCalculationRequest = (url: string): boolean => url.includes("/api/calculate/");

test.describe("4.4 Eingabevalidierung – clientseitig (kein API-Aufruf)", () => {
    /**
     * Executes the complete workflow for a given test case
     */
    const executeCompleteWorkflow = async (page: Page, testCaseName: string): Promise<void> => {
        console.log(`Running test case: ${testCaseName}`);

        const runner = new TestCaseRunner<ClientValidationTestData>(testDataConfig);
        const processedTestData = runner.setupTestCase(testCaseName);

        const pageFactory = new PageObjectFactory(page, expect);
        const pages = pageFactory.getAllPages();
        const assertionReporter = new AssertionReporter(test);
        const routeManager = new ApiRouteManager(page);
        routeManager.startRecording(isCalculationRequest);

        const openCalculatorPageStep = new OpenCalculatorPageTestStep(page, pages, processedTestData, assertionReporter);
        const enterOperandsStep = new EnterOperandsTestStep(page, pages, processedTestData, assertionReporter);
        const selectOperationStep = new SelectOperationTestStep(page, pages, processedTestData, assertionReporter);
        const submitCalculationStep = new SubmitCalculationTestStep(page, pages, processedTestData, assertionReporter);
        const fieldErrorVerificationStep = new FieldErrorVerificationTestStep(
            page,
            pages,
            processedTestData,
            assertionReporter,
            routeManager,
        );

        try {
            await openCalculatorPageStep.execute();
            await enterOperandsStep.execute();
            await selectOperationStep.execute();
            await submitCalculationStep.execute();
            await fieldErrorVerificationStep.execute();

            console.log(`Test case "${testCaseName}" completed successfully`);
        } catch (error) {
            console.error(`Test case "${testCaseName}" failed:`, error instanceof Error ? error.message : String(error));
            throw error;
        }
    };

    for (const testCaseName of testCases) {
        test(`${testCaseName} - Feldvalidierung`, { tag: testCaseRunner.getTags(testCaseName) }, async ({ page }) => {
            await executeCompleteWorkflow(page, testCaseName);
        });
    }
});
