import { expect } from "@playwright/test";
import type { Locator, Page, TestType } from "@playwright/test";
import type { AssertionInfo } from "../../types.js";
import { DateTimeUtils } from "../dateTimeManager/DateTimeUtils.js";

type PlaywrightTest = Pick<TestType<object, object>, "info">;

/**
 * Extended assertion utilities for detailed test reporting.
 * Every assertion is attached as JSON to the Playwright test report.
 */
export class AssertionReporter {
    constructor(private readonly test: PlaywrightTest) {}

    private async attach(name: string, info: AssertionInfo): Promise<void> {
        await this.test.info().attach(name, {
            body: JSON.stringify(info, null, 2),
            contentType: "application/json",
        });
    }

    /**
     * Equality assertion (deep for arrays/objects, strict for primitives) with automatic reporting
     */
    async expectEqual<T>(actual: T, expected: T, description: string, context = ""): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const isDeep =
            Array.isArray(expected) || Array.isArray(actual) || (typeof expected === "object" && expected !== null);
        const success = isDeep ? JSON.stringify(actual) === JSON.stringify(expected) : actual === expected;

        const assertionInfo: AssertionInfo = {
            timestamp,
            description,
            context,
            expected,
            actual,
            success,
            type: "equality",
            comparisonType: isDeep ? "deep" : "strict",
        };

        await this.attach(`assertion-${timestamp}`, assertionInfo);

        const message = context
            ? `${description} [${context}]: Erwartet '${String(expected)}', erhalten '${String(actual)}'`
            : `${description}: Erwartet '${String(expected)}', erhalten '${String(actual)}'`;

        if (isDeep) {
            expect(actual as unknown, message).toStrictEqual(expected);
        } else {
            expect(actual as unknown, message).toBe(expected);
        }

        return assertionInfo;
    }

    /**
     * Checks element visibility with detailed reporting (takes a screenshot on failure)
     */
    async expectVisible(element: Locator, description: string, context = ""): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const message = context ? `${description} [${context}] sollte sichtbar sein` : `${description} sollte sichtbar sein`;

        try {
            await expect(element, message).toBeVisible();
            const assertionInfo: AssertionInfo = {
                timestamp,
                description,
                context,
                elementSelector: element.toString(),
                success: true,
                type: "visibility",
            };
            await this.attach(`visibility-check-${timestamp}`, assertionInfo);
            return assertionInfo;
        } catch (error) {
            await this.test.info().attach("element-not-visible-screenshot", {
                body: await element.page().screenshot(),
                contentType: "image/png",
            });
            throw error;
        }
    }

    /**
     * Checks that an element is hidden / not present with detailed reporting
     */
    async expectHidden(element: Locator, description: string, context = ""): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const message = context
            ? `${description} [${context}] sollte nicht sichtbar sein`
            : `${description} sollte nicht sichtbar sein`;

        await expect(element, message).toBeHidden();

        const assertionInfo: AssertionInfo = {
            timestamp,
            description,
            context,
            elementSelector: element.toString(),
            success: true,
            type: "hidden",
        };
        await this.attach(`hidden-check-${timestamp}`, assertionInfo);
        return assertionInfo;
    }

    /**
     * Checks text content (exact, whitespace-normalised) with detailed reporting
     */
    async expectText(element: Locator, expectedText: string, description: string, context = ""): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const message = context
            ? `${description} [${context}]: Text sollte '${expectedText}' sein`
            : `${description}: Text sollte '${expectedText}' sein`;

        await expect(element, message).toHaveText(expectedText);
        const actualText = await element.textContent();

        const assertionInfo: AssertionInfo = {
            timestamp,
            description,
            context,
            elementSelector: element.toString(),
            expectedText,
            actualText,
            success: true,
            type: "text-content",
        };
        await this.attach(`text-check-${timestamp}`, assertionInfo);
        return assertionInfo;
    }

    /**
     * Checks that an element's text contains a substring with detailed reporting
     */
    async expectContainsText(
        element: Locator,
        expectedText: string,
        description: string,
        context = "",
    ): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const message = context
            ? `${description} [${context}]: Text sollte '${expectedText}' enthalten`
            : `${description}: Text sollte '${expectedText}' enthalten`;

        await expect(element, message).toContainText(expectedText);
        const actualText = await element.textContent();

        const assertionInfo: AssertionInfo = {
            timestamp,
            description,
            context,
            elementSelector: element.toString(),
            expectedText,
            actualText,
            success: true,
            type: "text-contains",
        };
        await this.attach(`text-contains-check-${timestamp}`, assertionInfo);
        return assertionInfo;
    }

    /**
     * Checks the page URL with detailed reporting
     */
    async expectUrl(page: Page, expectedUrl: string | RegExp, description: string, context = ""): Promise<AssertionInfo> {
        const timestamp = DateTimeUtils.getTimestamp();
        const message = context
            ? `${description} [${context}]: URL sollte '${expectedUrl.toString()}' entsprechen`
            : `${description}: URL sollte '${expectedUrl.toString()}' entsprechen`;

        await expect(page, message).toHaveURL(expectedUrl);

        const assertionInfo: AssertionInfo = {
            timestamp,
            description,
            context,
            expectedUrl: expectedUrl.toString(),
            actualUrl: page.url(),
            success: true,
            type: "url",
        };
        await this.attach(`url-check-${timestamp}`, assertionInfo);
        return assertionInfo;
    }

    /**
     * Creates a summary report of all collected assertions
     */
    async createSummaryReport(assertions: AssertionInfo[]): Promise<Record<string, unknown>> {
        const summary = {
            totalAssertions: assertions.length,
            successfulAssertions: assertions.filter((a) => a.success).length,
            failedAssertions: assertions.filter((a) => !a.success).length,
            timestamp: DateTimeUtils.getTimestamp(),
            details: assertions,
        };

        await this.test.info().attach("test-summary-report", {
            body: JSON.stringify(summary, null, 2),
            contentType: "application/json",
        });

        return summary;
    }
}
