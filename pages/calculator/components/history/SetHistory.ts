import type { Expect, Locator, Page } from "@playwright/test";
import { HistorySelectors } from "./HistorySelectors.js";

/**
 * Interactions with the calculation history
 */
export class SetHistory {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getClearButton(): Locator {
        return this.page
            .locator(HistorySelectors.SECTION)
            .getByRole("button", { name: HistorySelectors.CLEAR_BUTTON_TEXT });
    }

    /**
     * Clears the history via the "Leeren" button
     */
    async clickClear(): Promise<void> {
        await this.getClearButton().click();
    }
}
