import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    // Se siamo in modalità "development", assegna "dev", altrimenti usa la data di build
    const buildTime = mode === 'development' ? '"dev"' : JSON.stringify(new Date().toISOString());

    return {
        define: {
            'BUILD_TIME': buildTime
        },
        plugins: [
            sveltekit(),
            paraglide({
                project: './project.inlang',
                outdir: './src/lib/paraglide'
            })
        ]
    };
});
