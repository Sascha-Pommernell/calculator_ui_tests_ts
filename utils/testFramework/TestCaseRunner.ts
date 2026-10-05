import type { BaseTestData } from "../../types.js";
import type { DataFileConfig } from "../testData/BaseDataManager.js";
import { TestDataManager } from "../testData/TestDataManager.js";

export interface TestDataValidationResult {
    testCase: string;
    isValid: boolean;
    errors: string[];
}

/**
 * Test case orchestration helper – wraps a TestDataManager and simplifies
 * test discovery, setup and validation of the test data structure.
 */
export class TestCaseRunner<TData extends BaseTestData = BaseTestData> {
    readonly testDataManager: TestDataManager<TData>;

    constructor(testDataConfig: DataFileConfig) {
        this.testDataManager = new TestDataManager<TData>(testDataConfig);
    }

    /**
     * Returns all available test cases
     */
    getAvailableTestCases(): string[] {
        return this.testDataManager.getAllTestCases();
    }

    /**
     * Sets up test data for a specific test case (template variables resolved)
     */
    setupTestCase(testCaseName: string): TData {
        this.testDataManager.setCurrentTestCase(testCaseName);
        return this.testDataManager.getAllProcessedTestData();
    }

    /**
     * Sets up test data for a specific test case by index (template variables resolved)
     */
    setupTestCaseByIndex(index: number): TData {
        this.testDataManager.setCurrentTestCaseByIndex(index);
        return this.testDataManager.getAllProcessedTestData();
    }

    /**
     * Gets current test case name
     */
    getCurrentTestCaseName(): string | null {
        return this.testDataManager.getCurrentTestCaseName();
    }

    /**
     * Validates if a test case exists
     */
    isValidTestCase(testCaseName: string): boolean {
        return this.getAvailableTestCases().includes(testCaseName);
    }

    /**
     * Gets test data for current test case
     */
    getCurrentTestData(): TData {
        return this.testDataManager.getAllProcessedTestData();
    }

    /**
     * Gets specific category data from current test case
     */
    getCurrentTestDataCategory<K extends keyof TData>(category: K): TData[K] {
        return this.testDataManager.getProcessedTestData(category);
    }

    /**
     * Returns the priority tags of a test case (used for Playwright `tag` option)
     */
    getTags(testCaseName: string): string[] {
        return this.setupTestCase(testCaseName).tags ?? [];
    }

    /**
     * Logs test case information
     */
    logTestCaseInfo(testCaseName: string): void {
        if (!this.isValidTestCase(testCaseName)) {
            console.error(`Test case "${testCaseName}" not found!`);
            return;
        }
        const testData = this.setupTestCase(testCaseName);
        console.log(`\n=== Test Case: ${testCaseName} ===`);
        console.log("Environment:", this.testDataManager.environment);
        console.log("Base URL:", testData.urls.baseUrl);
        console.log("Tags:", testData.tags.join(", "));
        console.log("================================\n");
    }

    /**
     * Runs validation on test data structure
     */
    validateTestData(): TestDataValidationResult[] {
        return this.getAvailableTestCases().map((testCaseName) => {
            const testData = this.setupTestCase(testCaseName);
            const errors: string[] = [];

            if (!testData.urls?.baseUrl) {
                errors.push("Missing URL configuration (urls.baseUrl)");
            }
            if (testData.urls?.calculatorPath === undefined) {
                errors.push("Missing URL configuration (urls.calculatorPath)");
            }
            if (!Array.isArray(testData.tags) || testData.tags.length === 0) {
                errors.push("Missing priority tags");
            }

            return { testCase: testCaseName, isValid: errors.length === 0, errors };
        });
    }
}
