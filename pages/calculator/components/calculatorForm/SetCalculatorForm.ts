import type { Expect, Locator, Page } from "@playwright/test";
import { MIN_OPERANDS, OPERATION_LABELS } from "../../../../types.js";
import type { Operation } from "../../../../types.js";
import { CalculatorFormSelectors } from "./CalculatorFormSelectors.js";

/**
 * Fills and submits the calculator form (dynamic list of operand fields)
 */
export class SetCalculatorForm {
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

    getOperationRadio(operation: Operation): Locator {
        return this.page.getByRole("radio", { name: OPERATION_LABELS[operation] });
    }

    getSubmitButton(): Locator {
        return this.page.getByRole("button", { name: CalculatorFormSelectors.submitButtonName() });
    }

    /**
     * Fills the operand at the given 1-based position (clears the field first)
     */
    async fillOperand(position: number, value: string): Promise<void> {
        await this.getOperandInput(position).fill(value);
    }

    /**
     * Types additional characters into an operand without clearing
     */
    async typeIntoOperand(position: number, value: string): Promise<void> {
        await this.getOperandInput(position).pressSequentially(value);
    }

    /**
     * Adds an operand field via "Zahl hinzufügen"
     */
    async clickAddOperand(): Promise<void> {
        await this.getAddOperandButton().click();
    }

    /**
     * Removes the operand field at the given 1-based position
     */
    async clickRemoveOperand(position: number): Promise<void> {
        await this.getRemoveOperandButton(position).click();
    }

    /**
     * Adds or removes fields until exactly `count` operand fields exist (never below the minimum)
     */
    async ensureOperandCount(count: number): Promise<void> {
        const target = Math.max(count, MIN_OPERANDS);
        let current = await this.getOperandInputs().count();
        while (current < target) {
            await this.clickAddOperand();
            await this.expect(this.getOperandInputs()).toHaveCount(current + 1);
            current++;
        }
        while (current > target) {
            await this.clickRemoveOperand(current);
            await this.expect(this.getOperandInputs()).toHaveCount(current - 1);
            current--;
        }
    }

    /**
     * Ensures the right number of fields and fills all operands in order
     */
    async fillOperands(operands: string[]): Promise<void> {
        await this.ensureOperandCount(operands.length);
        for (const [index, value] of operands.entries()) {
            await this.fillOperand(index + 1, value);
        }
    }

    /**
     * Selects an operation via its radio button
     */
    async selectOperation(operation: Operation): Promise<void> {
        await this.getOperationRadio(operation).check();
    }

    /**
     * Clicks the submit button
     */
    async clickSubmit(): Promise<void> {
        await this.getSubmitButton().click();
    }

    /**
     * Convenience: fills all operands, selects the operation and submits
     */
    async submitCalculation(operation: Operation, operands: string[]): Promise<void> {
        await this.fillOperands(operands);
        await this.selectOperation(operation);
        await this.clickSubmit();
    }
}
