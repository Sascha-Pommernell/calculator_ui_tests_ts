import type { BaseTestData, TestDataSet } from "../../types.js";
import { DateTimeUtils } from "../dateTimeManager/DateTimeUtils.js";
import { BaseDataManager } from "./BaseDataManager.js";
import type { DataFileConfig, Environment } from "./BaseDataManager.js";

export const DEFAULT_UI_BASE_URL = "http://localhost:5173";

/**
 * Environment-specific test data loading with template variable replacement
 * (`{{BASE_URL}}`, `{{dateNow}}`, `{{currentDateDE}}`).
 */
export class TestDataManager<TData extends BaseTestData = BaseTestData> extends BaseDataManager {
    readonly testDataConfig: DataFileConfig;
    readonly environment: Environment;
    readonly testDataPath: string;
    readonly testDataSets: TestDataSet<TData>[];
    private currentTestData: TData | null = null;

    constructor(testDataConfig: DataFileConfig) {
        super();
        this.testDataConfig = testDataConfig;
        this.environment = this.getEnvironment();
        this.testDataPath = this.resolveTestDataPath();
        this.testDataSets = this.loadTestData();
    }

    /**
     * Resolves the test data file path based on environment and configuration
     * (naming convention: `<baseName>_Dev.json` / `<baseName>_Staging.json`)
     */
    resolveTestDataPath(): string {
        if (!this.testDataConfig?.baseName) {
            throw new Error("baseName is required in testDataConfig");
        }

        const config: DataFileConfig = {
            baseName: this.testDataConfig.baseName,
            devFile: this.testDataConfig.devFile ?? `${this.testDataConfig.baseName}_Dev.json`,
            stagingFile: this.testDataConfig.stagingFile ?? `${this.testDataConfig.baseName}_Staging.json`,
        };
        if (this.testDataConfig.subDirectory !== undefined) {
            config.subDirectory = this.testDataConfig.subDirectory;
        }

        return this.resolveDataFilePath(config, this.environment ?? "DEV");
    }

    /**
     * Loads test data from JSON file
     */
    loadTestData(): TestDataSet<TData>[] {
        const parsedData = this.loadJsonFile<TestDataSet<TData>[]>(this.testDataPath, true);

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            console.warn(`Warning: Test data file ${this.testDataPath} is empty. Using empty test data set.`);
            return [];
        }

        return parsedData;
    }

    /**
     * Returns all available test case names
     */
    getAllTestCases(): string[] {
        if (this.testDataSets.length === 0) {
            console.warn("No test data sets available");
            return [];
        }
        return this.testDataSets.map((testSet) => testSet.testCase);
    }

    /**
     * Sets the current test data by test case name
     */
    setCurrentTestCase(testCaseName: string): TData {
        const testSet = this.testDataSets.find((set) => set.testCase === testCaseName);
        if (!testSet) {
            throw new Error(`Test case "${testCaseName}" not found in test data`);
        }
        this.currentTestData = testSet.testData;
        return this.currentTestData;
    }

    /**
     * Sets the current test data by index
     */
    setCurrentTestCaseByIndex(index: number): TData {
        const testSet = this.testDataSets[index];
        if (!testSet) {
            throw new Error(`Test case index ${index} is out of range`);
        }
        this.currentTestData = testSet.testData;
        return this.currentTestData;
    }

    /**
     * Returns a specific test data category from the current test case
     */
    getTestData<K extends keyof TData>(category: K): TData[K] {
        if (!this.currentTestData) {
            throw new Error("No test case selected. Use setCurrentTestCase() first.");
        }
        return this.currentTestData[category];
    }

    /**
     * Returns all test data from the current test case
     */
    getAllTestData(): TData {
        if (!this.currentTestData) {
            throw new Error("No test case selected. Use setCurrentTestCase() first.");
        }
        return this.currentTestData;
    }

    /**
     * Returns the current test case name
     */
    getCurrentTestCaseName(): string | null {
        if (!this.currentTestData) {
            return null;
        }
        const currentSet = this.testDataSets.find((set) => set.testData === this.currentTestData);
        return currentSet ? currentSet.testCase : null;
    }

    /**
     * Resolves the UI base URL from the environment (`{TEST_ENVIRONMENT}` placeholder supported)
     */
    getBaseUrl(): string {
        const environment = this.getEnvironment().toLowerCase();
        const baseUrl = process.env["UI_BASE_URL"] ?? DEFAULT_UI_BASE_URL;
        return baseUrl.replace(/\{TEST_ENVIRONMENT\}/g, environment).replace(/\/+$/, "");
    }

    /**
     * Processes template variables in test data (e.g. {{dateNow}}, {{BASE_URL}})
     */
    processTemplateVariables<T>(data: T): T {
        const dataString = JSON.stringify(data);
        const today = new Date();

        const processedString = dataString
            .replace(/\{\{dateNow\}\}/g, DateTimeUtils.getDateNow(today))
            .replace(/\{\{currentDateDE\}\}/g, DateTimeUtils.getCurrentDate(today))
            .replace(/\{\{BASE_URL\}\}/g, this.getBaseUrl());

        return JSON.parse(processedString) as T;
    }

    /**
     * Returns processed test data category with template variables resolved
     */
    getProcessedTestData<K extends keyof TData>(category: K): TData[K] {
        return this.processTemplateVariables(this.getTestData(category));
    }

    /**
     * Returns all processed test data with template variables resolved
     */
    getAllProcessedTestData(): TData {
        return this.processTemplateVariables(this.getAllTestData());
    }
}
