import type { KVNamespace } from "@cloudflare/workers-types";

export type Bindings = {
  NAMES_KV: KVNamespace;
  D1: D1Database;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
};
