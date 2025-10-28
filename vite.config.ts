import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: if your GitHub repo name is NOT 'hide-his-word',
// change base to `"/<your-repo-name>/"` before deploying.
export default defineConfig({
  plugins: [react()],
  base: "/HideHisWord/",
});
