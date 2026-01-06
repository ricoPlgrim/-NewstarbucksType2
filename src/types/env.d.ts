declare namespace NodeJS {
  interface ProcessEnv {
    readonly PUBLIC_URL?: string;
  }
}

declare const process: {
  readonly env: NodeJS.ProcessEnv;
};

