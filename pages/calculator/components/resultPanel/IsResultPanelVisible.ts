import type { Expect, Locator, Page } from "@playwright/test";
import { ResultPanelSelectors } from "./ResultPanelSelectors.js";

/**
 * Visibility checks for the result panel states
 */
export class IsResultPanelVisible {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getRegion(): Locator {
        return this.page.getByRole("region", { name: ResultPanelSelectors.REGION_NAME });
    }

    async isResultValueVisible(): Promise<boolean> {
        return this.getRegion().getByTestId(ResultPanelSelectors.RESULT_VALUE_TEST_ID).isVisible();
    }

    async isErrorVisible(): Promise<boolean> {
        return this.getRegion().locator(ResultPanelSelectors.ERROR_ALERT).isVisible();
    }

    async isIdleHintVisible(): Promise<boolean> {
        return this.getRegion().getByText(ResultPanelSelectors.IDLE_HINT_TEXT).isVisible();
    }

    async isPendingHintVisible(): Promise<boolean> {
        return this.getRegion().getByText(ResultPanelSelectors.PENDING_HINT_TEXT).isVisible();
    }
}
