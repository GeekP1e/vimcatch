/** @type {import('tailwindcss').Config} */
export default {
    // Every file that can contain a Tailwind class name. JS is included
    // because components build class strings in template literals — always
    // as complete class names, never concatenated fragments (the scanner
    // cannot see those).
    content: [
        './index.html',
        './js/**/*.js'
    ],
    theme: {
        extend: {}
    },
    plugins: []
};
