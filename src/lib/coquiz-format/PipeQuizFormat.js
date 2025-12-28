import QuizFormat from './QuizFormat';
import QuizSheet from '../coquiz-models/QuizSheet';
import QuestionSheet from '../coquiz-models/QuestionSheet';
import AnswerSheet from '../coquiz-models/AnswerSheet.svelte';

export default class PipeQuizFormat extends QuizFormat {
    constructor() {
        super('PIPE');
    }

    detect(content) {
        try {
            // Normalize line endings first
            const normalizedContent = this._normalizeLineEndings(content);
            const lines = normalizedContent.split('\n');
            
            // Let's check if the file starts in the correct format
            if (lines[0] !== '|||||' || lines[1].substring(0,2) !== '||') {
                return false;
            }

            let i = 0;
            while (i < lines.length) {
                // If we find a question separator
                if (lines[i] === '|||||') {
                    // The next line must start with ||
                    if (i + 1 >= lines.length || !lines[i + 1].startsWith('||')) {
                        return false;
                    }

                    // Move past the separator
                    i++;

                    // Look for the end of the question (which will be when we find the first answer)
                    while (i < lines.length && !lines[i].startsWith('|-') && !lines[i].startsWith('|+')) {
                        if (lines[i] === '|||||') {  // If we find a new separator before the answers
                            return false;
                        }
                        i++;
                    }

                    // Verify that there are answers
                    let foundAnswer = false;
                    while (i < lines.length && (lines[i].startsWith('|-') || lines[i].startsWith('|+'))) {
                        foundAnswer = true;
                        i++;
                    }

                    if (!foundAnswer) {
                        return false;
                    }
                } else {
                    i++;
                }
            }

            return true;

        } catch {
            return false;
        }
    }

    getQuizSheet(fileName, content) {
        // Normalize line endings first
        const normalizedContent = this._normalizeLineEndings(content);
        
        const quizSheet = new QuizSheet();
        quizSheet.title = fileName;
        quizSheet.quizFormat = this.name;

        // Phase 1: Identify blocks (questions)
        const blocks = this._findQuestionBlocks(normalizedContent);
        
        // Phase 2: Parse each block (questions)
        blocks.forEach((block, index) => {
            const questionSheet = this._parseQuestionBlock(block, index + 1);
            if (questionSheet) {
                quizSheet.questionList.push(questionSheet);
            }
        });

        return quizSheet;
    }

    /**
     * Normalizes line endings to Unix-style (\n)
     * Handles Windows (\r\n), classic Mac (\r), and Unix (\n) line endings
     */
    _normalizeLineEndings(content) {
        return content
            .replace(/\r\n/g, '\n')  // Convert Windows CRLF to LF
            .replace(/\r/g, '\n');   // Convert classic Mac CR to LF
    }

    _findQuestionBlocks(content) {
        const blocks = [];
        // Content is already normalized, so we can safely split by \n
        const lines = content.split('\n'); // lascia le righe grezze
        
        let currentBlock = [];
        let isInsideBlock = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed === '|||||') {
                if (isInsideBlock) {
                    // End of current block
                    if (currentBlock.length > 0) {
                        blocks.push(currentBlock.join('\n'));
                    }
                    currentBlock = [];
                }
                isInsideBlock = true;
            } else if (isInsideBlock) {
                currentBlock.push(line);
            }
        });

        // Handle the last block if it exists
        if (currentBlock.length > 0) {
            blocks.push(currentBlock.join('\n'));
        }

        return blocks;
    }

    _parseQuestionBlock(block, questionNumber) {
        const lines = block.split('\n'); // lascia i newline
        const questionTextLines = [];
        let i = 0;
 
         // Look for the first line that starts with ||
         while (i < lines.length && !lines[i].trim().startsWith('||')) {
             i++;
         }
 
         // Collect all question lines until the first answer
         while (i < lines.length && !lines[i].trim().startsWith('|-') && !lines[i].trim().startsWith('|+')) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('||')) {
                questionTextLines.push(trimmed.substring(2).trimStart());
            } else {
                questionTextLines.push(lines[i]);
            }
             i++;
         }

        // If we haven't found question text, the block is not valid
        if (questionTextLines.length === 0) {
            return null;
        }

        const questionSheet = new QuestionSheet(questionTextLines.join('\n'), questionNumber);

        // Collect all answers
        while (i < lines.length) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('|-') || trimmed.startsWith('|+')) {
                const isCorrect = trimmed.startsWith('|+');
                const answerText = trimmed.substring(2).trim();
                const answer = new AnswerSheet(answerText, isCorrect);
                questionSheet.addAnswer(answer);
                
                if (isCorrect) {
                    questionSheet.correctAnswerNumber = 
                        (questionSheet.correctAnswerNumber || 0) + 1;
                }
            }
            i++;
        }

        return questionSheet;
    }
}