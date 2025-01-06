export default class QuizFormatRegistry {
    
    types; // Map<"Name",QuizFormat>

    constructor() {
        this.types = new Map();
    }

    addType(quizFormat) {
        this.types.set(quizFormat.name, quizFormat);
    }

    detect(content) {
        // eslint-disable-next-line no-unused-vars
        for (const [name, quizFormatInstance] of this.types) {
            if (quizFormatInstance.detect(content)) {
                return quizFormatInstance;
            }
        }
        return null;
    }

}