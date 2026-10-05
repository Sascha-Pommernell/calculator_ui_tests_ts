import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { AssertionInfo, BaseTestData, Pages } from "../../types.js";
import type { AssertionReporter } from "../report/AssertionReporter.js";

/**
 * Base class for all TestSteps
 * Provides common functionality and infrastructure
 */
export abstract class BaseTestStep<TData extends BaseTestData = BaseTestData> {
    protected readonly assertions: AssertionInfo[] = [];

    constructor(
        protected readonly page: Page,
        protected readonly pages: Pages,
        protected readonly testData: TData,
        protected readonly assertionReporter: AssertionReporter,
    ) {}

    /**
     * Executes a test step wrapped in Playwright's test.step()
     */
    protected async executeStep(stepName: string, stepFunction: () => Promise<void>): Promise<void> {
        await test.step(stepName, async () => {
            await stepFunction();
        });
    }

    /**
     * Adds an assertion to the assertions array
     */
    addAssertion(assertionInfo: AssertionInfo): void {
        this.assertions.push(assertionInfo);
    }

    /**
     * Returns all collected assertions
     */
    getAssertions(): AssertionInfo[] {
        return this.assertions;
    }

    /**
     * Logs progress of the step to the console
     */
    protected reportProgress(message: string): void {
        console.log(`  → ${message}`);
    }

    /**
     * Waits for a specified time (in milliseconds) – use sparingly, prefer web-first assertions
     */
    protected async wait(timeout = 1000): Promise<void> {
        await this.page.waitForTimeout(timeout);
    }

    /**
     * Waits for an element to be visible
     */
    protected async waitForElement(selector: string, timeout = 15_000): Promise<void> {
        await this.page.waitForSelector(selector, { state: "visible", timeout });
    }

    /**
     * Waits for network to be idle (no pending requests)
     */
    protected async waitForNetwork(timeout = 15_000): Promise<void> {
        await this.page.waitForLoadState("networkidle", { timeout });
    }

    /**
     * Waits for page to be fully loaded
     */
    protected async waitForPageLoad(timeout = 15_000): Promise<void> {
        await this.page.waitForLoadState("load", { timeout });
    }

    /**
     * Abstract method - must be implemented in derived classes
     */
    abstract execute(...args: unknown[]): Promise<void>;
}
