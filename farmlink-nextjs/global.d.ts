// Tells TypeScript that importing a .css file (e.g. import "@/app/components/forms.css")
// is valid, even though a .css file has no exported types. Without this, the editor
// shows a false "Cannot find module" warning for every CSS import — Next.js itself
// (webpack) already handles these imports fine at build time, this file only fixes
// the red squiggly line in VS Code.

declare module "*.css";
