import QuestionSheet from './QuestionSheet';
import AnswerSheet from './AnswerSheet.svelte';

export default class QuizSheet {

    title; // String
    quizFormat; // QuizFormat.name

    questionList; // Array<QuestionSheet>

    constructor() {
        this.questionList = [];
    }

    addQuestion(question) {
        this.questionList.push(question);
    }

    generateQuizCopy(options) {

        let sessionQuestionList = structuredClone(this.questionList);

        if (options) {

            if (sessionQuestionList.length >= 6) {

                sessionQuestionList = QuestionSheet.splitQuiz(
                    sessionQuestionList,
                    options.currentFraction,
                    options.selectedSubpart
                );

            }
            if (options.shuffleQuestions) sessionQuestionList.sort(() => Math.random() - 0.5);
            if (options.shuffleAnswers) {

                sessionQuestionList.forEach(singleQuestion => {
                    // First trim the answer annotations
                    singleQuestion.answerList.forEach(answer => {
                        answer.answerBody = AnswerSheet.trimListAnnotation(answer.answerBody);
                    });

                    // Then shuffle answers if option is enabled
                    if (options && options.shuffleAnswers) {
                        singleQuestion.answerList.sort(() => Math.random() - 0.5);
                    }
                });

            }

        }

        return sessionQuestionList;

    }

}
