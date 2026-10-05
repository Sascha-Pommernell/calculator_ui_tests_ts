import type { Expect, Locator, Page } from "@playwright/test";
import { ResultPanelSelectors } from "./ResultPanelSelectors.js";

/**
 * Reads the content of the result panel (expression, exact result, error, hint)
 */
export class GetResultPanel {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getRegion(): Locator {
        return this.page.getByRole("region", { name: ResultPanelSelectors.REGION_NAME });
    }

    getResultValue(): Locator {
        return this.getRegion().getByTestId(ResultPanelSelectors.RESULT_VALUE_TEST_ID);
    }

    /**
     * Expression line above the result, e.g. "1 + 2 ="
     */
    getExpression(): Locator {
        return this.getRegion().locator(ResultPanelSelectors.EXPRESSION, { hasText: "=" });
    }

    getErrorAlert(): Locator {
        return this.getRegion().locator(ResultPanelSelectors.ERROR_ALERT);
    }

    /**
     * Hint paragraph shown in idle/pending state
     */
    getHint(): Locator {
        return this.getRegion().locator(ResultPanelSelectors.HINT, { hasNotText: "=" });
    }

    async getResultValueText(): Promise<string> {
        return (await this.getResultValue().textContent())?.trim() ?? "";
    }

    async getExpressionText(): Promise<string> {
        return (await this.getExpression().textContent())?.trim() ?? "";
    }

    async getErrorMessageText(): Promise<string> {
        return (await this.getErrorAlert().textContent())?.trim() ?? "";
    }

    async getHintText(): Promise<string> {
        return (await this.getHint().textContent())?.trim() ?? "";
    }
}
