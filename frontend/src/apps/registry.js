//**
// * Automatically discovers and loads all sub-application manifests
// * located in src/apps/*/index.jsx at build/runtime.
// */
const appModules = import.meta.glob('./*/index.jsx', { eager: true });

export const registeredApps = Object.entries(appModules)
  .map(([filePath, module]) => {
    const manifest = module.default;
    if (!manifest || !manifest.id || !manifest.component) {
      console.warn(`[Aleph Registry] Invalid manifest skipped at: ${filePath}`);
      return null;
    }
    return manifest;
  })
  .filter(Boolean)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));