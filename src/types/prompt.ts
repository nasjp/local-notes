export type Prompt = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  prompts: Prompt[];
  version: 1;
};

export const STORAGE_KEY = "prompt-storage:v1";
