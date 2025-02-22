/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_ANTHROPIC_API_KEY: string;
  readonly MAIN_VITE_OPENAI_API_KEY: string;
  readonly MAIN_VITE_GOOGLE_GENERATIVE_AI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
