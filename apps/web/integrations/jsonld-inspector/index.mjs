// Astro integration: adds a "JSON-LD" app to the dev toolbar (astro dev only).
// Everything runs in your browser — nothing is sent anywhere.

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>`;

/** @returns {import('astro').AstroIntegration} */
export default function jsonLdInspector() {
  return {
    name: 'jsonld-inspector',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, command }) => {
        if (command !== 'dev') return;
        addDevToolbarApp({
          id: 'jsonld-inspector',
          name: 'JSON-LD',
          icon: ICON,
          entrypoint: new URL('./app.mjs', import.meta.url),
        });
      },
    },
  };
}
