<script>

	// Svelte base path
	import { base } from '$app/paths';

	// Svelte Components
	import QuizRunner from './QuizRunner.svelte';
	import QuizPartitionSelector from './QuizPartitionSelector.svelte';
	import CyclicTitle from './CyclicTitle.svelte';

	// Content retriever lib
	import ContentRetriever from '$lib/ContentRetriever';

	// Quiz formats related lib
	import QuizFormatRegistry from '$lib/coquiz-format/registry/QuizFormatRegistry';
	import PipeQuizFormat from '$lib/coquiz-format/PipeQuizFormat';

	const supportedFormats = new QuizFormatRegistry();
	supportedFormats.addType(new PipeQuizFormat());

	// Coquiz models
	import QuestionSheet from '$lib/coquiz-models/QuestionSheet';

	// State management
	let isDarkTheme = $state(true);

	// Dynamically apply the theme class
	$effect(() => {
		document.documentElement.classList.toggle('dark', isDarkTheme);
	});

	// Screen Navigation vars
	let showModal = $state(false);
	let showQuiz = $state(false);

	let currentScreen = $state('HOME');

	$effect(() => {
		if (showModal) {
			// Disable scroll when modal is visible
			document.body.style.overflow = 'hidden';
		} else {
			// Restore scroll when modal is not visible
			document.body.style.overflow = '';
		}
	});

	// Activate shuffle questions when limiting questions
	$effect(() => {
		if (appSettings.limitQuestions) {
			appSettings.shuffleQuestions = true;
		}
	});

	// maintain "answer limit" within the bounds of the question list
	$effect(() => {
		if (loadedQuizSheet) {
			appSettings.questionsLimit = Math.min(
				Math.max(1, appSettings.questionsLimit),
				loadedQuizSheet.questionList.length
			);
		}
	});

	// State management vars

	let fileInput = $state({}); // Reference to input DOM node
	let fileContent = $state({}); // Reference to file content container

	let loadedQuizSheet = $state(null); // QuizSheet
	const contentRetriever = new ContentRetriever();

	// Auto-discovery dei quiz disponibili usando Vite's import.meta.glob
	const availableDemoQuizzes = import.meta.glob('/static/demo-quizzes/*.{md,txt}', { 
		as: 'raw',
		eager: false 
	});

	// Estrai i nomi dei quiz dal path
	const demoQuizList = Object.keys(availableDemoQuizzes).map(path => {
		const filename = path.split('/').pop();
		const name = filename.replace(/\.(md|txt)$/, '');
		const title = name.split('-').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join(' ');
		
		return {
			filename,
			name,
			title,
			path
		};
	});

	let selectedQuizPartLength = $derived(
		!loadedQuizSheet
			? 0
			: QuestionSheet.calculateSplitLength(
					loadedQuizSheet.questionList,
					appSettings.currentFraction,
					appSettings.selectedSubpart
				)
	);

	let sessionQuestionList = $state();

	async function handleFileChange(event) {
		try {
			const file = event.target.files[0];
			if (!file) return;

			// Use ContentRetriever to get the content
			const content = await contentRetriever.readFileAsText(file);

			// Show content (for debug)
			fileContent.textContent = content;

			const detectedFormatType = supportedFormats.detect(content);

			if (detectedFormatType === null) throw new Error('Formato non supportato');

			// TODO: move elsewhere
			let fileNameWithoutExtension = file.name.includes('.')
				? file.name.slice(0, file.name.lastIndexOf('.'))
				: file.name;

			loadedQuizSheet = detectedFormatType.getQuizSheet(fileNameWithoutExtension, content);

			// Reset input file value to allow reselecting the same file
			event.target.value = '';
		} catch (error) {
			// TODO: add more errors handling
			console.error(`Errore nella lettura del file: ${error.message}`, error);
			alert(`Errore nella lettura del file: ${error.message}`);

			return;
		}
	}

	async function loadDemoQuiz(quizPath, quizTitle) {
		try {
			// Carica il quiz usando l'import dinamico
			const content = await availableDemoQuizzes[quizPath]();
			
			// Show content (for debug)
			fileContent.textContent = content;

			const detectedFormatType = supportedFormats.detect(content);

			if (detectedFormatType === null) throw new Error('Formato quiz non supportato');

			loadedQuizSheet = detectedFormatType.getQuizSheet(quizTitle, content);
			
		} catch (error) {
			console.error(`Errore nel caricamento del quiz: ${error.message}`, error);
			alert(`Errore nel caricamento del quiz: ${error.message}`);
		}
	}

	let appSettings = $state({
		shuffleQuestions: false,
		shuffleAnswers: false,
		currentFraction: 1,
		selectedSubpart: 1,
		limitQuestions: false,
    	questionsLimit: 30,  // default value
		autoAdvanceOnComplete: false  // nuova opzione per l'avanzamento automatico
	});

	const BUILD_NUMBER = import.meta.env.VITE_BUILD_NUMBER;

	// Svelte INSPECT

	$inspect(loadedQuizSheet);
	$inspect(sessionQuestionList);
	$inspect(appSettings);
</script>

<!-- Radial gradient from center -->
<main
    class="min-h-screen bg-gray-100 p-4 md:p-8 dark:bg-[radial-gradient(ellipse_at_top,_#111827,_#0f1729,_#0f1729)]"
>
    {#if currentScreen === 'HOME'}
        <!-- Theme toggle -->
        <div class="fixed right-4 top-4">
            <button
                onclick={() => (isDarkTheme = !isDarkTheme)}
                class="flex items-center justify-center rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="Toggle Theme"
            >
                {#if isDarkTheme}
                    🌙 <!-- Icon for dark mode -->
                {:else}
                    ☀️ <!-- Icon for light mode -->
                {/if}
            </button>
        </div>

        <!-- Header section with logo and title -->
		<div class="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-12 gap-y-4 mb-12 md:mb-16 text-center">
			<img
				src={base+"/coquiz-logo.svg"}
				alt="Coquiz Logo"
				class="h-16 md:h-24 w-auto"
			/>
			<CyclicTitle />
		</div>

        <div class="mx-auto max-w-4xl space-y-8 md:space-y-12"> <!-- spacing regolabile per mobile/desktop -->
            <!-- New quiz loading section in box -->
            <div class="space-y-4 rounded-lg bg-white p-4 md:p-6 shadow-lg dark:bg-gray-800">
                <h2 class="text-center text-base md:text-lg text-gray-500 dark:text-gray-400">Carica un nuovo quiz</h2>
                <div class="flex flex-wrap justify-center gap-4">
                    <button
                        class="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition-colors hover:bg-blue-700"
                        onclick={() => {
                            fileInput.click();
                        }}
                    >
                        Seleziona File
                    </button>

					<!--<button
						class="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
						onclick={() => {
							// TODO: future functionality
						}}
					>
						Altri formati
					</button>-->
				</div>

				<p class="text-center text-sm text-gray-600 dark:text-gray-400">
					Carica un file di quiz in formato .txt o .md, oppure prova un quiz demo:
				</p>
				
				{#if demoQuizList.length > 0}
					<div class="text-center space-y-2">
						<p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
							Quiz disponibili:
						</p>
						<div class="flex flex-wrap justify-center gap-2">
							{#each demoQuizList as quiz}
								<button 
									onclick={() => loadDemoQuiz(quiz.path, quiz.title)}
									class="group inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
								>
									<span class="text-xs font-medium border-b border-dotted border-green-600 dark:border-green-400 group-hover:border-solid">
										📄 {quiz.title}
									</span>
									<span class="text-xs group-hover:translate-x-0.5 transition-transform duration-200">→</span>
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<div class="text-center">
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Nessun quiz demo disponibile!
						</p>
					</div>
				{/if}

				<input
					type="file"
					bind:this={fileInput}
					accept=".txt,.md"
					class="hidden"
					onchange={handleFileChange}
				/>
			</div>

			<!-- Loaded quiz section -->
			{#if loadedQuizSheet !== null}
				<div class="space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
					<div class="text-center">
						<h2 class="text-lg text-gray-500 dark:text-gray-400">Quiz caricato</h2>
						<p class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
							{loadedQuizSheet.title}
						</p>
						<span class="inline-block mt-2 mb-3 text-sm text-white border border-blue-400/40 px-2 py-1 rounded-lg bg-blue-600/90">
							Domande: {loadedQuizSheet.questionList.length}
						</span>
					</div>

					<div class="flex justify-center">
						<button
							class="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
							onclick={() => {
								showModal = true;
							}}
						>
							Vedi il contenuto del file
						</button>
					</div>

					<!-- Quiz options -->
					<div class="mt-8 space-y-6">
						{#if loadedQuizSheet.questionList.length > 6}
							<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
								<QuizPartitionSelector
									defaultOptions={appSettings}
									partSelected={(currentFraction, selectedSubpart) => {
										appSettings = { ...appSettings, currentFraction, selectedSubpart };
									}}
								/>

								{#if appSettings.currentFraction !== 1}
									<p class="mt-4 text-center text-gray-600 dark:text-gray-400">
										Dell'intero quiz, prenderai solamente una frazione da {selectedQuizPartLength} domande
									</p>
								{:else}
									<p class="mt-4 text-center text-gray-600 dark:text-gray-400">
										Affronta l'intero quiz da {selectedQuizPartLength} domande
									</p>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Question/answer extra options -->
					<div class="mx-auto max-w-4xl rounded-lg bg-white p-3 sm:p-6 shadow-sm dark:bg-gray-800">
						<div class="flex flex-col lg:flex-row lg:gap-8 space-y-6 lg:space-y-0 lg:items-stretch">
							<!-- Question options -->
							<div class="lg:flex-1 flex flex-col">
								<div class="flex items-center space-x-2 mb-4">
									<span class="text-xl">❓</span>
									<h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100">Opzioni Domande</h3>
								</div>
								
								<!-- Contenitore per tutte le opzioni domande -->
								<div class="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-4 flex-1">
								<!-- Limita quiz -->
								<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<label class="flex items-center cursor-pointer space-x-3">
										<input
											type="checkbox"
											bind:checked={appSettings.limitQuestions}
											class="h-5 w-5 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-gray-700 dark:text-gray-300">Limita quiz a</span>
									</label>
									
									<!-- Controlli numerici - allineati a destra su dispositivi medi/grandi -->
									<div class="flex items-center gap-2 ml-8 sm:ml-0">
										<div class="flex items-center space-x-2">
											<button 
												class="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 min-w-[24px]"
												disabled={appSettings.questionsLimit <= 10}
												onclick={() => appSettings.questionsLimit = Math.max(10, appSettings.questionsLimit - 10)}
											>
												-
											</button>
									
											<input 
												type="number"
												bind:value={appSettings.questionsLimit}
												min="1"
												max={loadedQuizSheet?.questionList.length ?? 1}
												class="w-20 text-sm rounded border border-gray-300 p-1 text-center 
													dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
												onclick={(e) => e.target.select()} 
												ontouch={(e) => e.target.select()}
											/>
									
											<button 
												class="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 min-w-[24px]"
												disabled={appSettings.questionsLimit >= loadedQuizSheet?.questionList.length}
												onclick={() => appSettings.questionsLimit = Math.min(loadedQuizSheet?.questionList.length ?? 1, appSettings.questionsLimit + 10)}
											>
												+
											</button>
										</div>
										
										<span class="text-sm text-gray-700 dark:text-gray-300">domande</span>
									</div>
								</div>									<!-- Separatore -->
									<hr class="border-gray-300 dark:border-gray-600" />

									<!-- Mescola ordine -->
									<label class="flex items-center cursor-pointer space-x-3">
										<input
											type="checkbox"
											bind:checked={appSettings.shuffleQuestions}
											disabled={appSettings.limitQuestions}
											class="h-5 w-5 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
										/>
										<span class="text-gray-700 dark:text-gray-300 {appSettings.limitQuestions ? 'opacity-50' : ''}">
											Mescola ordine delle domande
										</span>
									</label>
								</div>
							</div>

							<!-- Answer options -->
							<div class="lg:flex-1 flex flex-col">
								<div class="flex items-center space-x-2 mb-4">
									<span class="text-xl">💡</span>
									<h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100">Opzioni Risposte</h3>
								</div>
								
								<!-- Contenitore per tutte le opzioni risposte -->
								<div class="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-4 flex-1">
									<!-- Mescola risposte -->
									<label class="flex items-center cursor-pointer space-x-3">
										<input
											type="checkbox"
											bind:checked={appSettings.shuffleAnswers}
											class="h-5 w-5 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-gray-700 dark:text-gray-300">Mescola ordine delle risposte</span>
									</label>

									<!-- Separatore -->
									<hr class="border-gray-300 dark:border-gray-600" />

									<!-- Avanzamento automatico -->
									<label class="flex items-center cursor-pointer space-x-3">
										<input
											type="checkbox"
											bind:checked={appSettings.autoAdvanceOnComplete}
											class="h-5 w-5 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span class="text-gray-700 dark:text-gray-300">Avanzamento automatico quando completi una domanda</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					<!-- Start quiz button -->
					<div class="flex justify-center pt-1">
						<button
							class="rounded-lg bg-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
							onclick={() => {
								sessionQuestionList = loadedQuizSheet.generateQuizCopy({
									...appSettings
								});
								currentScreen = 'QUIZ_SCREEN';
							}}
						>
							Vai al quiz
						</button>
					</div>
				</div>
			{/if}

			<!-- Footer -->
			<div class="rounded-lg border-gray-200 bg-white p-6 shadow-lg dark:bg-gray-800">
				<div class="space-y-2 text-center text-sm text-gray-600 dark:text-gray-400">
					<p>© 2025 VFansss</p>
					<p>
						Made with <span class="text-red-500">❤ </span> & 🤚 by 
						<a
							href="https://github.com/VFansss"
							class="text-blue-600 hover:underline dark:text-blue-400"
							target="_blank"
							rel="noopener noreferrer"
						>
                        VFansss
						</a>
					</p>
					<p>Build: {BUILD_TIME}</p>
				</div>
			</div>
		</div>
	{:else if currentScreen === 'QUIZ_SCREEN'}

		<QuizRunner 
			returnHomePressed={() => {
				currentScreen = 'HOME';
				return;
			}} 
			quizInfo={loadedQuizSheet} 
			questionList={sessionQuestionList}
			autoAdvanceOnComplete={appSettings.autoAdvanceOnComplete}
		/>

	{/if}

	<!-- Modal -->
	{#if showModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div
				class="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800"
			>
				<div class="flex-1 overflow-auto p-6">
					<h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
						File Content
					</h2>
					<div class="max-h-[60vh] overflow-auto">
						<pre
							class="whitespace-pre-wrap break-words rounded bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">{fileContent.textContent}</pre>
					</div>
				</div>
				<div class=" border-gray-200 p-4 text-center dark:border-gray-700">
					<button
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						onclick={() => (showModal = false)}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	:global(html) {
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}
</style>