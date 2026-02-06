/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/components/**/*.{vue,js,ts}",
        "./src/layouts/**/*.vue",
        "./src/pages/**/*.vue",
        "./src/plugins/**/*.{js,ts}",
        "./src/app.vue",
        "./src/error.vue",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                },
                dark: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#334155',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
