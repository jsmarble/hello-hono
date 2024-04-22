import type { KVNamespace } from "@cloudflare/workers-types";

export type Bindings = {
  NAMES_KV: KVNamespace;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
};
