<script>
    import QuestionSheet from '$lib/coquiz-models/QuestionSheet';
    import QuizSheet from '$lib/coquiz-models/QuizSheet';

    let { returnHomePressed, quizInfo, questionList } = $props();

    let currentQuestionIndex = $state(0);
    let goneToQuizEndOnce = $state(false);
    let quizResults = $state();
    let currentScreen = $state('QUIZ');
    let showRecap = $state(false);
    let showAnswer = $state(false);
    let isHorizontalLayout = $state(false);
    let scrollPoint; // Used to store the scroll position when switching between questions

    let answeredQuestions = $derived(
        questionList.filter((question) => QuestionSheet.isAnswerSelectionComplete(question)).length
    );

    function toggleRecapScreen(value) {
        showRecap = value;
        if (showRecap) {
            goneToQuizEndOnce = true;
            quizResults = QuestionSheet.calculateQuizResults(questionList);
        }
    }

    function handleCheckboxChange(event, singleQuestion, singleAnswer) {
        if (!singleAnswer.checked) {
            const checkedAnswers = singleQuestion.answerList.filter((answer) => answer.checked).length;

            if (checkedAnswers >= singleQuestion.correctAnswerNumber) {
                event.preventDefault();
                event.stopPropagation();
                alert(
                    'Hai selezionato troppe opzioni, puoi selezionarne al massimo ' +
                        singleQuestion.correctAnswerNumber
                );
            }
        }
    }

    function goToFirstUnansweredQuestion() {
        // Cycle through questionList, and find the index of the first question where QuestionSheet.isAnswerSelectionComplete is false. If every question returns true, return -1
        let firstNonAnseredQuestionIndex = questionList.findIndex(
            (question) => !QuestionSheet.isAnswerSelectionComplete(question)
        );

        if (firstNonAnseredQuestionIndex === -1) {
            // Set the currentQuestionIndex to the last question (useful for "go back" button)
            currentQuestionIndex = questionList.length - 1;

            // Every question has been answered
            toggleRecapScreen(true);
        } else {
            currentQuestionIndex = firstNonAnseredQuestionIndex;
            toggleRecapScreen(false);
        }

        return firstNonAnseredQuestionIndex;
    }

    $effect.pre(() => {

        showAnswer = false;

        if (scrollPoint) {
            scrollPoint.scrollIntoView({ behavior: 'smooth' });
        }

        // Make sure currentQuestionIndex is read synchronously, thus make Svelte run this function every time currentQuestionIndex changes
        const _ = currentQuestionIndex;
    });

    $inspect(questionList);
    $inspect(answeredQuestions);
</script>

<!-- Top Navigation Bar -->
<div class="mx-auto mb-8 max-w-4xl rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <div class="flex items-center justify-between">
        <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            onclick={() => returnHomePressed()}
        >
            Torna alla home
        </button>

        <button
            class="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onclick={() => (isHorizontalLayout = !isHorizontalLayout)}
        >
            {isHorizontalLayout ? '↕️ Layout Verticale' : '↔️ Layout Orizzontale'}
        </button>
    </div>
</div>

{#if !showRecap}
    <!-- Main Quiz Content -->
    <div class="mx-auto max-w-7xl px-4">
        <!-- Quiz Progress -->
        <div class="mb-6 text-center">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {quizInfo.title}
            </h2>
            <p bind:this={scrollPoint} class="mt-2 text-gray-600 dark:text-gray-400">
                Domanda {currentQuestionIndex + 1} di {questionList.length}
            </p>
        </div>

        <!-- Quiz Content Layout -->
        <div class={`flex ${isHorizontalLayout ? 'flex-row' : 'flex-col'} gap-8`}>
            <!-- Question Section -->
            <div
                class={`${isHorizontalLayout ? 'w-1/2' : 'w-full'} rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800`}
            >
                <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Domanda</h3>
                {#each questionList as singleQuestion, questionIndex}
                    {#if currentQuestionIndex === questionIndex}
                        <div class="space-y-4">
                            <p class="text-gray-800 dark:text-gray-200">
                                {singleQuestion.body}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Risposte corrette: {singleQuestion.correctAnswerNumber}
                            </p>
                        </div>
                    {/if}
                {/each}
            </div>

            <!-- Answers Section -->
            <div
                class={`${isHorizontalLayout ? 'w-1/2' : 'w-full'} rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800`}
            >
                <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Risposte</h3>
                {#each questionList as singleQuestion, questionIndex}
                    {#if currentQuestionIndex === questionIndex}
                        <div class="space-y-3">
                            {#each singleQuestion.answerList as singleAnswer, answerIndex}
                                <label
                                    class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <input
                                        type="checkbox"
                                        bind:checked={singleAnswer.checked}
                                        onclick={(event) => handleCheckboxChange(event, singleQuestion, singleAnswer)}
                                        class="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span class="flex-1 text-gray-800 dark:text-gray-200">
                                        {singleAnswer.answerBody}
                                        {#if showAnswer && singleAnswer.isCorrect}
                                            <span class="ml-2 text-green-500">✓</span>
                                        {/if}
                                    </span>
                                </label>
                            {/each}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div class="mx-auto max-w-2xl px-4">
        <div class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <!-- Summary Title -->
            <h2 class="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
                Riepilogo
            </h2>

            {#if answeredQuestions === questionList.length}
                <!-- Completion Message -->
                <p class="mb-8 text-center text-xl text-gray-700 dark:text-gray-300">
                    Quiz terminato: hai risposto a tutte le domande
                </p>

                <!-- Statistics -->
                <div class="space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-700/50">
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Numero domande</p>
                            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {quizResults.totalQuestions}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Risposte corrette</p>
                            <p class="text-2xl font-semibold text-green-600 dark:text-green-400">
                                {quizResults.totalCorrectAnswers}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Risposte sbagliate</p>
                            <p class="text-2xl font-semibold text-red-600 dark:text-red-400">
                                {quizResults.totalQuestions - quizResults.totalCorrectAnswers}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Punteggio</p>
                            <p class="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {quizResults.totalScore}%
                            </p>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="text-center">
                    <p class="text-xl text-gray-700 dark:text-gray-300">
                        Hai risposto a {answeredQuestions} domande su {questionList.length}
                    </p>

                    <p
                        class="mt-4 text-lg font-medium text-red-600 decoration-red-500 dark:text-red-400"
                    >
                        Non hai risposto a tutte le domande
                    </p>

                    <button
                        class="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                        onclick={() => {
                            goToFirstUnansweredQuestion();
                        }}
                    >
                        Vai alla prima domanda senza risposta
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<!-- Navigation Buttons -->
<div class="mx-auto mt-8 max-w-4xl px-4">
    <div
        class="flex flex-wrap justify-center gap-4 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
    >
        <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            onclick={() => {
                if (showRecap) toggleRecapScreen(!showRecap);
                else if (currentQuestionIndex > 0) currentQuestionIndex--;
            }}
            disabled={currentQuestionIndex === 0}
        >
            ← Indietro
        </button>

        <button
            style:display={showRecap ? 'none' : ''}
            class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            onclick={() => (showAnswer = !showAnswer)}
        >
            {#if questionList[currentQuestionIndex].correctAnswerNumber > 1}
                Mostra risposte corrette
            {:else}
                Mostra risposta corretta
            {/if}
        </button>

        <button
            style:display={showRecap ? 'none' : ''}
            class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            onclick={() => {
                if (currentQuestionIndex === questionList.length - 1) {
                    toggleRecapScreen(true);
                } else {
                    currentQuestionIndex++;
                }
            }}
        >
            {currentQuestionIndex === questionList.length - 1 ? 'Vai al riepilogo →' : 'Avanti →'}
        </button>

        {#if goneToQuizEndOnce}
            <button
                style:display={showRecap ? 'none' : ''}
                class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                onclick={() => {
                    let firstNonAnseredQuestionIndex = goToFirstUnansweredQuestion();
                    if (firstNonAnseredQuestionIndex == currentQuestionIndex) toggleRecapScreen(true);
                }}
            >
                Avanti veloce ⏭️
            </button>
        {/if}
    </div>
</div>

<style>
</style>