module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: 'var(--bg-color)',
                    text: 'var(--text-color)',
                    cardBg: 'var(--card-bg-color)',
                    cardText: 'var(--card-text-color)',
                    buttonBg: 'var(--button-bg-color)',
                    buttonText: 'var(--button-text-color)',
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/aspect-ratio')
    ],
    darkMode: 'class',
}