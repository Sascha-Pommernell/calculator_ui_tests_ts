import type { Expect, Locator, Page } from "@playwright/test";
import { ApiStatusSelectors } from "./ApiStatusSelectors.js";

/**
 * Reads the API status indicator in the page header
 */
export class GetApiStatus {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getStatus(): Locator {
        return this.page.locator(ApiStatusSelectors.STATUS);
    }

    async getStatusText(): Promise<string> {
        return (await this.getStatus().textContent())?.trim() ?? "";
    }

    /**
     * Value of the data-status attribute: "checking" | "online" | "offline"
     */
    async getDataStatus(): Promise<string | null> {
        return this.getStatus().getAttribute(ApiStatusSelectors.DATA_STATUS_ATTRIBUTE);
    }
}
