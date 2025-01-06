export default class QuestionSheet {

    body; // String
    originalQuestionNumber; // number
    answerList; // Array<AnswerSheet>
    correctAnswerNumber; // number

    constructor(body, originalQuestionNumber) {
        this.body = body;
        this.originalQuestionNumber = originalQuestionNumber;
        this.answerList = [];
    }

    addAnswer(answer) {
        this.answerList.push(answer);
    }

    static isAnswerSelectionComplete(singleQuestion) {
        return singleQuestion.answerList.filter(answer => answer.checked).length >= singleQuestion.correctAnswerNumber;
    }

    static isAnswerSelectionCorrect(singleQuestion){
        
        return singleQuestion.answerList.filter(answer => answer.checked && answer.isCorrect).length === singleQuestion.correctAnswerNumber;

    }

    static calculateQuizResults(questionList) {

        let totalQuestions = questionList.length;
        let totalCorrectAnswers = questionList.filter(question => QuestionSheet.isAnswerSelectionCorrect(question)).length;
        let totalWrongAnswers = totalQuestions - totalCorrectAnswers;
        let totalScore = (totalCorrectAnswers / totalQuestions * 100).toFixed(3);

        return {
            totalQuestions,
            totalCorrectAnswers,
            totalWrongAnswers,
            totalScore
        };

    }

    static calculateSplitLength(questionList, fraction, partToTake) {
        if (!questionList || questionList.length === 0) {
            return 0;
        }
        if (fraction === 1) {
            return questionList.length;
        }

        // Calculate how many pieces we're splitting into
        const totalPieces = Math.round(1 / fraction);

        // Validate partToTake
        if (partToTake < 1 || partToTake > totalPieces) {
            throw new Error(`Part ${partToTake} is invalid for splitting into ${totalPieces} pieces`);
        }

        // Calculate base chunk size and remaining items
        const baseChunkSize = Math.floor(questionList.length / totalPieces);
        const remainingItems = questionList.length % totalPieces;

        // The chunk will have an extra item if it's one of the last chunks that need to handle remaining items
        return baseChunkSize + (partToTake > totalPieces - remainingItems ? 1 : 0);
    }

    static splitQuiz(questionList, fraction, partToTake) {
        if (!questionList || questionList.length === 0) {
            return [];
        }
        if (fraction === 1) {
            return questionList;
        }

        // Calculate how many pieces we're splitting into
        const totalPieces = Math.round(1 / fraction);

        // Validate partToTake
        if (partToTake < 1 || partToTake > totalPieces) {
            throw new Error(`Part ${partToTake} is invalid for splitting into ${totalPieces} pieces`);
        }

        // Calculate base chunk size and remaining items
        const baseChunkSize = Math.floor(questionList.length / totalPieces);
        const remainingItems = questionList.length % totalPieces;

        // Initialize our result array and tracking variables
        let result = [];
        let currentIndex = 0;

        // Process each chunk one at a time
        for (let i = 1; i <= totalPieces; i++) {
            // Calculate this chunk's size
            // Add an extra item if we have remaining items and we're in one of the last chunks
            const thisChunkSize = baseChunkSize + 
                (i > totalPieces - remainingItems ? 1 : 0);

            // If this is the chunk we want, collect it
            if (i === partToTake) {
                result = questionList.slice(currentIndex, currentIndex + thisChunkSize);
                break;
            }

            // Move to next chunk's starting position
            currentIndex += thisChunkSize;
        }

        return result;
    }

}