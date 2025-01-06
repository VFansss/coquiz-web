export default class AnswerSheet {

    answerBody; // String
    isCorrect; // Boolean
    // eslint-disable-next-line no-undef
    checked = $state(false); // Boolean

    constructor(answerBody, isCorrect) {
        this.answerBody = answerBody;
        this.isCorrect = isCorrect;
        this.checked = false;
    }

    static trimListAnnotation(answerBody) {
        // This regex will match:
        // - One letter or number at the start (^([A-z]|[0-9]){1})
        // - Followed by either ) or . ((\)|\.))
        // - Followed by zero or more spaces ([ ]*)
        return answerBody.replace(/^([A-z]|[0-9]){1}(\)|\.)\s*/, '');
    }

}