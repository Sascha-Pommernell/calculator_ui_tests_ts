import type { Expect, Locator, Page } from "@playwright/test";
import { CalculatorPageSelectors } from "./CalculatorPageSelectors.js";
import { GetApiStatus } from "./components/apiStatus/GetApiStatus.js";
import { GetCalculatorForm } from "./components/calculatorForm/GetCalculatorForm.js";
import { IsCalculatorFormDisabled } from "./components/calculatorForm/IsCalculatorFormDisabled.js";
import { SetCalculatorForm } from "./components/calculatorForm/SetCalculatorForm.js";
import { GetHistory } from "./components/history/GetHistory.js";
import { IsHistoryVisible } from "./components/history/IsHistoryVisible.js";
import { SetHistory } from "./components/history/SetHistory.js";
import { GetResultPanel } from "./components/resultPanel/GetResultPanel.js";
import { IsResultPanelVisible } from "./components/resultPanel/IsResultPanelVisible.js";

/**
 * Page Object Model for the calculator page (route "/")
 * Composes the component handlers for form, result panel, history and API status
 */
export class CalculatorPage {
    readonly setCalculatorForm: SetCalculatorForm;
    readonly getCalculatorForm: GetCalculatorForm;
    readonly isCalculatorFormDisabled: IsCalculatorFormDisabled;
    readonly getResultPanel: GetResultPanel;
    readonly isResultPanelVisible: IsResultPanelVisible;
    readonly getHistory: GetHistory;
    readonly setHistory: SetHistory;
    readonly isHistoryVisible: IsHistoryVisible;
    readonly getApiStatus: GetApiStatus;

    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {
        this.setCalculatorForm = new SetCalculatorForm(page, expect);
        this.getCalculatorForm = new GetCalculatorForm(page, expect);
        this.isCalculatorFormDisabled = new IsCalculatorFormDisabled(page, expect);
        this.getResultPanel = new GetResultPanel(page, expect);
        this.isResultPanelVisible = new IsResultPanelVisible(page, expect);
        this.getHistory = new GetHistory(page, expect);
        this.setHistory = new SetHistory(page, expect);
        this.isHistoryVisible = new IsHistoryVisible(page, expect);
        this.getApiStatus = new GetApiStatus(page, expect);
    }

    /**
     * Navigates to the calculator page
     */
    async goto(url: string): Promise<void> {
        await this.page.goto(url);
        await this.getHeading().waitFor({ state: "visible" });
    }

    getHeading(): Locator {
        return this.page.getByRole("heading", {
            level: CalculatorPageSelectors.HEADING_LEVEL,
            name: CalculatorPageSelectors.HEADING_TEXT,
        });
    }

    async getTitle(): Promise<string> {
        return this.page.title();
    }
}
