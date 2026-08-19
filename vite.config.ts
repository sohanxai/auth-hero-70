// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Pick the server build target from the host's own environment variables so the
// same repo deploys anywhere without editing this file:
//   - Vercel            -> VERCEL=1        -> `vercel` (Build Output API)
//   - Netlify           -> NETLIFY=true    -> `netlify`
//   - Cloudflare Pages  -> CF_PAGES=1      -> `cloudflare_pages`
//   - Anything else     -> NITRO_PRESET    -> e.g. `node_server`, `bun`, `deno_server`
// Inside Lovable no variable is set and the default (Cloudflare) is used.
function resolvePreset(): string | undefined {
  if (process.env.NITRO_PRESET) return process.env.NITRO_PRESET;
  if (process.env.VERCEL) return "vercel";
  if (process.env.NETLIFY) return "netlify";
  if (process.env.CF_PAGES) return "cloudflare_pages";
  return undefined;
}

const preset = resolvePreset();

export default defineConfig({
  ...(preset ? { nitro: { preset: preset as never } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [mcpPlugin()],
  },
});
