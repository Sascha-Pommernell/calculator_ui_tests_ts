export class CalculatorFormSelectors {
    static FORM = "form";
    static OPERANDS_GROUP_NAME = "Zahlen";
    /** Label prefix of the operand fields: "Zahl 1", "Zahl 2", … */
    static OPERAND_LABEL_PREFIX = "Zahl";
    static OPERAND_INPUT = 'input[inputmode="decimal"]';
    static ADD_OPERAND_BUTTON_TEXT = "Zahl hinzufügen";
    /** Accessible name of the remove buttons: "Zahl <n> entfernen" */
    static REMOVE_OPERAND_BUTTON_SUFFIX = "entfernen";
    static OPERATION_GROUP_NAME = "Operation";
    static OPERATION_RADIO = 'input[type="radio"][name="operation"]';
    static SUBMIT_BUTTON_TEXT = "Berechnen";
    static SUBMIT_BUTTON_LOADING_TEXT = "Berechne…";
    static FIELD_ERROR = 'p[role="alert"]';

    static operandLabel(position: number): string {
        return `${CalculatorFormSelectors.OPERAND_LABEL_PREFIX} ${position}`;
    }

    static removeOperandButtonName(position: number): string {
        return `${CalculatorFormSelectors.operandLabel(position)} ${CalculatorFormSelectors.REMOVE_OPERAND_BUTTON_SUFFIX}`;
    }

    static submitButtonName(): RegExp {
        return new RegExp(
            `^(${CalculatorFormSelectors.SUBMIT_BUTTON_TEXT}|${CalculatorFormSelectors.SUBMIT_BUTTON_LOADING_TEXT})$`,
        );
    }
}
