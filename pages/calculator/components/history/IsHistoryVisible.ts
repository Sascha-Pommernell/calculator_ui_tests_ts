import type { Expect, Locator, Page } from "@playwright/test";
import { HistorySelectors } from "./HistorySelectors.js";

/**
 * Visibility checks for the calculation history
 */
export class IsHistoryVisible {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getSection(): Locator {
        return this.page.locator(HistorySelectors.SECTION);
    }

    async isSectionVisible(): Promise<boolean> {
        return this.getSection().isVisible();
    }

    async isHeadingVisible(): Promise<boolean> {
        return this.page.getByRole("heading", { name: HistorySelectors.HEADING_TEXT }).isVisible();
    }
}
