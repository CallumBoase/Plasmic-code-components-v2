import { createBrowserClient } from "@supabase/ssr"
import { Database } from "@/types/supabase";

export default function login() {

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  supabase.auth.signInWithPassword({
    email: 'callum.boase@gmail.com',
    password: 'P12341234'
  }).then(function(response) {
    console.log(response)
  }).catch(function(error) {
    console.log(error)
  });

  return (
    <div>login</div>
  )
}