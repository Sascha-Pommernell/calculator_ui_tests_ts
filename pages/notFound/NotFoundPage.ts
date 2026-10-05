import type { Expect, Locator, Page } from "@playwright/test";
import { NotFoundPageSelectors } from "./NotFoundPageSelectors.js";

/**
 * Page Object Model for the "Seite nicht gefunden" route (catch-all "*")
 */
export class NotFoundPage {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    /**
     * Navigates to an unknown route
     */
    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    getHeading(): Locator {
        return this.page.getByRole("heading", { name: NotFoundPageSelectors.HEADING_TEXT });
    }

    getBackLink(): Locator {
        return this.page.getByRole("link", { name: NotFoundPageSelectors.BACK_LINK_TEXT });
    }

    /**
     * Follows the link back to the calculator
     */
    async clickBackLink(): Promise<void> {
        await this.getBackLink().click();
    }
}
