import { JsonHomesteadRepo } from "./json-store";
import type { HomesteadRepo } from "./types";

export { DEFAULT_PROFILE_ID } from "./types";
export type { HomesteadRepo } from "./types";

let instance: HomesteadRepo | null = null;

export function getStore(): HomesteadRepo {
  if (!instance) {
    instance = new JsonHomesteadRepo();
  }
  return instance;
}

// Test helper: swap the singleton with a custom repo (e.g. in-memory).
export function setStoreForTesting(repo: HomesteadRepo | null): void {
  instance = repo;
}
