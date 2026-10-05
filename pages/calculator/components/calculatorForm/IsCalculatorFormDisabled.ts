import type { Expect, Locator, Page } from "@playwright/test";
import { CalculatorFormSelectors } from "./CalculatorFormSelectors.js";

/**
 * Checks the disabled/busy state of the calculator form controls
 */
export class IsCalculatorFormDisabled {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getForm(): Locator {
        return this.page.locator(CalculatorFormSelectors.FORM);
    }

    getOperandInput(position: number): Locator {
        return this.page.getByLabel(CalculatorFormSelectors.operandLabel(position), { exact: true });
    }

    getOperandInputs(): Locator {
        return this.getForm().locator(CalculatorFormSelectors.OPERAND_INPUT);
    }

    getAddOperandButton(): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.ADD_OPERAND_BUTTON_TEXT });
    }

    getOperationGroup(): Locator {
        return this.page.getByRole("group", { name: CalculatorFormSelectors.OPERATION_GROUP_NAME });
    }

    /**
     * Radio buttons of the operation group – a disabled fieldset disables them
     */
    getOperationRadios(): Locator {
        return this.page.locator(CalculatorFormSelectors.OPERATION_RADIO);
    }

    getSubmitButton(): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.submitButtonName() });
    }

    async isOperandDisabled(position: number): Promise<boolean> {
        return this.getOperandInput(position).isDisabled();
    }

    /**
     * True if every operand input is disabled
     */
    async areAllOperandsDisabled(): Promise<boolean> {
        return this.areAllDisabled(this.getOperandInputs());
    }

    async isAddOperandButtonDisabled(): Promise<boolean> {
        return this.getAddOperandButton().isDisabled();
    }

    /**
     * The fieldset's `disabled` attribute is not evaluated by Playwright's isDisabled(),
     * therefore the state of the contained radio buttons is checked
     */
    async isOperationGroupDisabled(): Promise<boolean> {
        return this.areAllDisabled(this.getOperationRadios());
    }

    async isSubmitButtonDisabled(): Promise<boolean> {
        return this.getSubmitButton().isDisabled();
    }

    /**
     * aria-busy of the form while a calculation is pending
     */
    async isFormBusy(): Promise<boolean> {
        return (await this.getForm().getAttribute("aria-busy")) === "true";
    }

    private async areAllDisabled(elements: Locator): Promise<boolean> {
        const count = await elements.count();
        for (let index = 0; index < count; index++) {
            if (!(await elements.nth(index).isDisabled())) return false;
        }
        return count > 0;
    }
}
