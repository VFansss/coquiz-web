<script>
    import QuestionSheet from '$lib/coquiz-models/QuestionSheet';

    let { questionList, showCorrectAnswer = false, onQuestionSelect } = $props();

    function getQuestionStatus(question, index) {
        const isAnswered = QuestionSheet.isAnswerSelectionComplete(question);
        
        if (showCorrectAnswer && isAnswered) {
            // Modalità quiz terminato: verde se corretto, rosso se sbagliato
            const results = QuestionSheet.calculateQuizResults([question]);
            return results.totalCorrectAnswers > 0 ? 'correct' : 'incorrect';
        } else if (isAnswered) {
            // Modalità quiz non terminato: blu se risposto
            return 'answered';
        } else {
            // Bianco se non risposto
            return 'unanswered';
        }
    }

    function handleQuestionClick(questionIndex) {
        onQuestionSelect(questionIndex);
    }
</script>

<div class="question-selector">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Panoramica domande
    </h3>
    
    <div class="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-10 lg:grid-cols-10 gap-2 max-w-md mx-auto">
        {#each questionList as question, index}
            <button
                class="question-box {getQuestionStatus(question, index)}"
                onclick={() => handleQuestionClick(index)}
                title="Domanda {index + 1}"
            >
                {index + 1}
            </button>
        {/each}
    </div>

    <!-- Legenda -->
    <div class="legend mt-6 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex flex-wrap justify-center gap-4">
            {#if showCorrectAnswer}
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Risposta corretta</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Risposta sbagliata</span>
                </div>
            {:else}
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Risposta data</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
                    <span>Non risposta</span>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .question-box {
        width: 2rem;
        height: 2rem;
        border-radius: 0.25rem;
        border-width: 2px;
        font-size: 0.75rem;
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .question-box:hover {
        transform: scale(1.1);
    }

    .question-box:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }

    .question-box.unanswered {
        background-color: white;
        border-color: rgb(156, 163, 175);
        color: rgb(55, 65, 81);
    }

    .question-box.unanswered:hover {
        background-color: rgb(249, 250, 251);
    }

    .question-box.answered {
        background-color: rgb(59, 130, 246);
        border-color: rgb(37, 99, 235);
        color: white;
    }

    .question-box.answered:hover {
        background-color: rgb(37, 99, 235);
    }

    .question-box.correct {
        background-color: rgb(34, 197, 94);
        border-color: rgb(22, 163, 74);
        color: white;
    }

    .question-box.correct:hover {
        background-color: rgb(22, 163, 74);
    }

    .question-box.incorrect {
        background-color: rgb(239, 68, 68);
        border-color: rgb(220, 38, 38);
        color: white;
    }

    .question-box.incorrect:hover {
        background-color: rgb(220, 38, 38);
    }

    /* Dark mode adjustments */
    :global(.dark) .question-box.unanswered {
        background-color: rgb(55, 65, 81);
        border-color: rgb(107, 114, 128);
        color: rgb(229, 231, 235);
    }

    :global(.dark) .question-box.unanswered:hover {
        background-color: rgb(75, 85, 99);
    }

    /* Responsive grid - 5 columns on mobile */
    @media (max-width: 640px) {
        .grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
        }
    }
</style>
