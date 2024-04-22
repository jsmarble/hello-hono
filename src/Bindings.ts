import type { KVNamespace } from "@cloudflare/workers-types";

export type Bindings = {
  NAMES_KV: KVNamespace;
  TURSO_AUTH_TOKEN: string;
  TURSO_DATABASE_URL: string;
};
