<script>
    import { onMount } from 'svelte';
    import { fly, scale } from 'svelte/transition';
    
    // Animation timing constants (in milliseconds)
    const WORD_DISPLAY_TIME = 6000;  // How long each word remains visible
    const TRANSITION_DURATION = 400;  // Duration of transition animations
    const FADE_OUT_DELAY = 300;      // Delay before word change
    const MAX_CYCLES = 2;

    // List of words to cycle through
    // TODO: avoid hardcoding
    const originalPrefixes = ["Collaborative", "Cooperative", "Connected", "Community", "Collective","Companion"];

    // Function to randomize the array
    function shuffleArray(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    let prefixes = shuffleArray(originalPrefixes);
    let currentIndex = 0;
    let isAnimating = true;
    let displayText = prefixes[0];
    let visible = true;
    let quizVisible = true;
    let cycleCount = 0;

    onMount(() => {
        const interval = setInterval(() => {
            if (!isAnimating) return;
            
            visible = false;
            quizVisible = false;
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % prefixes.length;
                
                if (currentIndex === 0) {
                    cycleCount++;
                    if (cycleCount >= MAX_CYCLES) {
                        isAnimating = false;
                    }
                }
                
                displayText = prefixes[currentIndex];
                visible = true;
                quizVisible = true;
                
            }, FADE_OUT_DELAY);
            
        }, WORD_DISPLAY_TIME);

        return () => clearInterval(interval);
    });
</script>

<div class="flex justify-start items-center text-2xl md:text-4xl font-bold text-gray-900 dark:text-white w-full md:w-auto">
    <div class="relative flex justify-center md:justify-end min-w-[12ch] w-full md:w-auto">
        {#if visible}
            <span transition:fly={{ y: 20, duration: TRANSITION_DURATION }}>
                <span class="text-blue-600">{displayText.slice(0, 2)}</span>{displayText.slice(2)}
            </span>
        {/if}
        {#if quizVisible}
            <span 
                class="text-blue-600"
                transition:scale={{ 
                    duration: TRANSITION_DURATION,
                    start: 0.8,
                    opacity: 0.5
                }}
            >
                quiz
            </span>
        {/if}
    </div>
</div>