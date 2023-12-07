
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

const supabaseBrowserClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export default supabaseBrowserClient;