import type { Expect, Locator, Page } from "@playwright/test";
import { OPERATIONS } from "../../../../types.js";
import type { Operation } from "../../../../types.js";
import { CalculatorFormSelectors } from "./CalculatorFormSelectors.js";

/**
 * Reads the current state of the calculator form
 */
export class GetCalculatorForm {
    constructor(
        readonly page: Page,
        readonly expect: Expect,
    ) {}

    getForm(): Locator {
        return this.page.locator(CalculatorFormSelectors.FORM);
    }

    /**
     * Operand input by 1-based position ("Zahl 1", "Zahl 2", …)
     */
    getOperandInput(position: number): Locator {
        return this.page.getByLabel(CalculatorFormSelectors.operandLabel(position), { exact: true });
    }

    getOperandInputs(): Locator {
        return this.getForm().locator(CalculatorFormSelectors.OPERAND_INPUT);
    }

    getAddOperandButton(): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.ADD_OPERAND_BUTTON_TEXT });
    }

    getRemoveOperandButton(position: number): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.removeOperandButtonName(position) });
    }

    getRemoveOperandButtons(): Locator {
        return this.page.getByRole("button", {
            name: new RegExp(`${CalculatorFormSelectors.REMOVE_OPERAND_BUTTON_SUFFIX}$`),
        });
    }

    getSubmitButton(): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.submitButtonName() });
    }

    /**
     * Error message element belonging to a field (the field wrapper contains label, input and error)
     */
    getFieldError(input: Locator): Locator {
        return input.locator("xpath=..").locator(CalculatorFormSelectors.FIELD_ERROR);
    }

    getOperandError(position: number): Locator {
        return this.getFieldError(this.getOperandInput(position));
    }

    /**
     * All field errors in document order
     */
    getAllFieldErrors(): Locator {
        return this.getForm().locator(CalculatorFormSelectors.FIELD_ERROR);
    }

    async getOperandCount(): Promise<number> {
        return this.getOperandInputs().count();
    }

    async getOperandValue(position: number): Promise<string> {
        return this.getOperandInput(position).inputValue();
    }

    /**
     * Values of all operand fields in order
     */
    async getOperandValues(): Promise<string[]> {
        const inputs = this.getOperandInputs();
        const count = await inputs.count();
        const values: string[] = [];
        for (let index = 0; index < count; index++) {
            values.push(await inputs.nth(index).inputValue());
        }
        return values;
    }

    /**
     * Returns the currently selected operation
     */
    async getSelectedOperation(): Promise<Operation | null> {
        for (const operation of OPERATIONS) {
            const radio = this.page.locator(`${CalculatorFormSelectors.OPERATION_RADIO}[value="${operation}"]`);
            if (await radio.isChecked()) return operation;
        }
        return null;
    }

    async getSubmitButtonText(): Promise<string> {
        return (await this.getSubmitButton().textContent())?.trim() ?? "";
    }

    /**
     * Returns the error text of a field or null when no error is displayed
     */
    async getFieldErrorText(input: Locator): Promise<string | null> {
        const error = this.getFieldError(input);
        if ((await error.count()) === 0) return null;
        return (await error.textContent())?.trim() ?? null;
    }

    async getOperandErrorText(position: number): Promise<string | null> {
        return this.getFieldErrorText(this.getOperandInput(position));
    }

    /**
     * Returns the aria-invalid attribute of a field ("true" or null)
     */
    async getAriaInvalid(input: Locator): Promise<string | null> {
        return input.getAttribute("aria-invalid");
    }

    /**
     * Returns whether the input has focus
     */
    async isFocused(input: Locator): Promise<boolean> {
        return input.evaluate((element) => element === document.activeElement);
    }
}
