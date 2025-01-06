export default class QuizFormat {

    name;

    constructor(name) {
        this.name = name;
    }

    // eslint-disable-next-line no-unused-vars
    detect(content) {
        throw new Error('detect method must be implemented');
    }

    // eslint-disable-next-line no-unused-vars
    getQuizSheet(content){
        throw new Error('detect method must be implemented');
    }

}