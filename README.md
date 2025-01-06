# coquiz-web

![Coquiz Logo](static/coquiz-logo.svg)

Web-app made for executing quizzes from files.

Built with Svelte and SvelteKit static site generator.

## Features

- **Dynamic Quiz Loading** 📂: Load quiz content from files.
- **Quiz Format Support** 📚: Supports multiple quiz formats through a registry.
- **Theming** 🎨: Supports dark and light themes.
- **Modal Display** 🖼️: Display file content in a modal with scrollable content.
- **Animated Titles** 🎬: Cyclic title animations using Svelte transitions.

## Tech Used

This project is built with:

- [SvelteKit](https://kit.svelte.dev/) - Application framework
- [Svelte](https://svelte.dev/) - Component framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Development

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Run the development server:
    ```sh
    npm run dev
    ```

4. Change whatever you have

## Project Structure

- `src/routes/+page.svelte`: Main page component.
- `src/routes/QuizRunner.svelte`: Component to run the quiz.
- `src/routes/QuizPartitionSelector.svelte`: Component to select quiz partitions.
- `src/routes/CyclicTitle.svelte`: Component for animated title.
- `src/lib/ContentRetriever.js`: Library to retrieve content from files.
- `static/coquiz-logo.svg`: Project logo.