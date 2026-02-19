import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import type { Database } from "./types";

export function Supabase() {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}
