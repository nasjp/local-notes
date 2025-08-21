export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  notes: Note[];
  version: 1;
};

export const STORAGE_KEY = "local-notes:v1";
