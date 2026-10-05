import type { Expect, Locator, Page } from "@playwright/test";
import { HistorySelectors } from "./HistorySelectors.js";

/**
 * Reads the calculation history list
 */
export class GetHistory {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getSection(): Locator {
        return this.page.locator(HistorySelectors.SECTION);
    }

    getHeading(): Locator {
        return this.page.getByRole("heading", { name: HistorySelectors.HEADING_TEXT });
    }

    getList(): Locator {
        return this.getSection().locator(HistorySelectors.LIST);
    }

    getItems(): Locator {
        return this.getList().locator(HistorySelectors.ITEM);
    }

    /**
     * Text content of all entries, newest first (e.g. "1 + 2 =3")
     */
    async getEntries(): Promise<string[]> {
        const texts = await this.getItems().allTextContents();
        return texts.map((text) => text.trim());
    }

    async getEntryCount(): Promise<number> {
        return this.getItems().count();
    }
}
