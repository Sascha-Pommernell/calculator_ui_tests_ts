import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { UiBehaviorTestData } from "../types.js";
import { ApiRouteManager } from "../utils/networkManager/ApiRouteManager.js";
import { PageObjectFactory } from "../utils/pageObjectModel/PageObjectFactory.js";
import { AssertionReporter } from "../utils/report/AssertionReporter.js";
import { TestCaseRunner } from "../utils/testFramework/TestCaseRunner.js";
import {
    ApiStatusVerificationTestStep,
    ClearHistoryTestStep,
    ErrorMessageVerificationTestStep,
    FieldErrorClearsOnEditTestStep,
    HistoryVerificationTestStep,
    InitialPageStateVerificationTestStep,
    NetworkInterceptionTestStep,
    NotFoundNavigationTestStep,
    OpenCalculatorPageTestStep,
    OperandFieldsTestStep,
    PendingStateVerificationTestStep,
    PerformCalculationsTestStep,
    SubmitScenarioCalculationTestStep,
} from "./steps/index.js";

// Load test data once at module level with environment-specific configuration
const testDataConfig = {
    baseName: "uiBehavior",
    subDirectory: "uiBehaviorTestData",
    devFile: "uiBehavior_Dev.json",
    stagingFile: "uiBehavior_Staging.json",
};
const testCaseRunner = new TestCaseRunner<UiBehaviorTestData>(testDataConfig);
const testCases = testCaseRunner.getAvailableTestCases();

test.describe("4.5 UI-Verhalten – Status, Netzwerkfehler, Pending, Verlauf, Navigation", () => {
    /**
     * Executes the scenario-specific workflow for a given test case
     */
    const executeCompleteWorkflow = async (page: Page, testCaseName: string): Promise<void> => {
        console.log(`Running test case: ${testCaseName}`);

        const runner = new TestCaseRunner<UiBehaviorTestData>(testDataConfig);
        const processedTestData = runner.setupTestCase(testCaseName);

        const pageFactory = new PageObjectFactory(page, expect);
        const pages = pageFactory.getAllPages();
        const assertionReporter = new AssertionReporter(test);
        const routeManager = new ApiRouteManager(page);

        const openCalculatorPageStep = new OpenCalculatorPageTestStep(page, pages, processedTestData, assertionReporter);
        const networkInterceptionStep = new NetworkInterceptionTestStep(
            page,
            pages,
            processedTestData,
            assertionReporter,
            routeManager,
        );
        const performCalculationsStep = new PerformCalculationsTestStep(page, pages, processedTestData, assertionReporter);
        const expected = processedTestData.expected ?? {};

        try {
            switch (processedTestData.scenario) {
                case "initial-page-state": {
                    await openCalculatorPageStep.execute();
                    await new InitialPageStateVerificationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "api-status-online": {
                    await openCalculatorPageStep.execute();
                    await new ApiStatusVerificationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "api-status-offline": {
                    await networkInterceptionStep.execute();
                    await openCalculatorPageStep.execute();
                    await new ApiStatusVerificationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "network-error":
                case "gateway-error": {
                    await openCalculatorPageStep.execute();
                    await networkInterceptionStep.execute();
                    await new SubmitScenarioCalculationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    await new ErrorMessageVerificationTestStep(page, pages, processedTestData, assertionReporter).execute(
                        expected.errorMessage ?? "Die API ist nicht erreichbar",
                    );
                    break;
                }
                case "pending-state": {
                    await openCalculatorPageStep.execute();
                    await networkInterceptionStep.execute();
                    await new PendingStateVerificationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "history-order-and-clear": {
                    await openCalculatorPageStep.execute();
                    await performCalculationsStep.execute();
                    await new HistoryVerificationTestStep(page, pages, processedTestData, assertionReporter).execute(
                        expected.historyEntries ?? [],
                    );
                    await new ClearHistoryTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "history-limit": {
                    await openCalculatorPageStep.execute();
                    await performCalculationsStep.execute();
                    await new HistoryVerificationTestStep(page, pages, processedTestData, assertionReporter).execute(
                        expected.historyEntries ?? [],
                        expected.historyLimit,
                    );
                    break;
                }
                case "field-error-clears-on-edit": {
                    await openCalculatorPageStep.execute();
                    await new FieldErrorClearsOnEditTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "operand-fields-add-remove": {
                    await openCalculatorPageStep.execute();
                    await new OperandFieldsTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                case "not-found-route": {
                    await new NotFoundNavigationTestStep(page, pages, processedTestData, assertionReporter).execute();
                    break;
                }
                default:
                    throw new Error(`Unbekanntes Szenario: ${String(processedTestData.scenario)}`);
            }

            console.log(`Test case "${testCaseName}" completed successfully`);
        } catch (error) {
            console.error(`Test case "${testCaseName}" failed:`, error instanceof Error ? error.message : String(error));
            throw error;
        } finally {
            await routeManager.clearRoutes();
        }
    };

    for (const testCaseName of testCases) {
        test(`${testCaseName}`, { tag: testCaseRunner.getTags(testCaseName) }, async ({ page }) => {
            await executeCompleteWorkflow(page, testCaseName);
        });
    }
});
