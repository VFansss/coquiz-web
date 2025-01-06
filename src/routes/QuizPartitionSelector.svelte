<script>
    let { defaultOptions = {}, partSelected } = $props();

    // TODO: this is fugly, change it
    let currentFraction = $state(defaultOptions.currentFraction ? defaultOptions.currentFraction : 1); // Current fraction
    let selectedSubpart = $state(defaultOptions.selectedSubpart ? defaultOptions.selectedSubpart : 1); // Selected part

    // Function to update the fraction (WHOLE, HALF, etc.)
    const updateProgress = (fraction) => {
        currentFraction = fraction;
        selectedSubpart = 1; // Reset the selected part to the first part
        partSelected(currentFraction, selectedSubpart); // Notify parent component
    };

    // Function to update the specific selected part
    const updateSubpart = (subpart) => {
        selectedSubpart = subpart;
        partSelected(currentFraction, selectedSubpart); // Notify parent component
    };

    // Calculate starting position and width of the highlighted bar
    const calculateBarStyle = () => {
        const totalParts = Math.ceil(1 / currentFraction); // Total number of fractions
        const partWidth = 100 / totalParts; // Percentage occupied by each fraction
        const left = (selectedSubpart - 1) * partWidth; // Start of the selected part
        return { left: `${left}%`, width: `${partWidth}%` };
    };
</script>

<div class="space-y-6">
    <!-- Title -->
    <h3 class="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
        Parziale del quiz
    </h3>

    <!-- Progress bar -->
    <div class="h-5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
            class="h-full bg-blue-600 transition-all duration-300 ease-in-out dark:bg-blue-500"
            style="width: {calculateBarStyle().width}; margin-left: {calculateBarStyle().left};"
        ></div>
    </div>

    <!-- Fraction selection -->
    <div class="flex flex-col items-center space-y-8">
        <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6"
        >
            {#each [{ value: 1, label: 'INTERO' }, { value: 0.5, label: "META'" }, { value: 1 / 3, label: '1/3' }, { value: 1 / 6, label: '1/6' }] as option}
                <label class="flex cursor-pointer items-center space-x-3">
                    <input
                        type="radio"
                        name="fraction"
                        class="h-6 w-6 cursor-pointer rounded-full border-2 border-gray-400 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-800"
                        value={option.value}
                        onclick={() => updateProgress(option.value)}
                        checked={currentFraction === option.value}
                    />
                    <span class="text-gray-800 dark:text-gray-200">{option.label}</span>
                </label>
            {/each}
        </div>

        <!-- Subpart selection -->
        {#if currentFraction !== 1}
            <div
                class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center lg:gap-6"
            >
                {#each Array(Math.ceil(1 / currentFraction)) as _, index}
                    <label class="flex cursor-pointer items-center space-x-3">
                        <input
                            type="radio"
                            name="subpart"
                            class="h-6 w-6 cursor-pointer rounded-full border-2 border-gray-400 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-800"
                            value={index + 1}
                            onclick={() => updateSubpart(index + 1)}
                            checked={selectedSubpart === index + 1}
                        />
                        <span class="text-gray-800 dark:text-gray-200">{index + 1}a parte</span>
                    </label>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
</style>