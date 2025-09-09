// Tailwind CSS v4: use the dedicated PostCSS plugin only; do NOT include the old `tailwindcss` plugin key
// Reference: https://tailwindcss.com/docs/installation
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Autoprefixer is optional here (Next.js + Tailwind already cover most cases), but keeping explicitly
    autoprefixer: {},
  },
};
