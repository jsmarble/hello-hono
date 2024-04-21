import type { KVNamespace } from "@cloudflare/workers-types";

export type Bindings = {
  NAMES_KV: KVNamespace;
};
