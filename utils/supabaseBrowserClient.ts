import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type SimulateUserSettings = {
  simulateLoggedInUser: boolean;
  email: string;
  password: string;
};

const supabaseBrowserClient = async (
  simulateUserSettings?: SimulateUserSettings
) => {
  //Create the supabase client like normal
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  //Determine whether we're returning normal supabase client
  //Or using email/password values from the App Settings -> UserProvider to simulate a logged in user while working in the studio
  //Reason this needed: the app is inside an iframe when working in a studio, meaning localStorage & cookies do not work
  //So if we want to view login-protected data while working in the studio, we must simulate a user this way
  
  const shouldSimulate =
    process.env.NODE_ENV === "development" &&
    simulateUserSettings &&
    simulateUserSettings.simulateLoggedInUser ? true : false;

  if (!shouldSimulate) {
    return supabase;
  } else {

    //Check we have all required values
    if (
      !simulateUserSettings ||
      !simulateUserSettings.email ||
      !simulateUserSettings.password
    )
      throw new Error(
        "You have elected to simulate a logged in user for studio development. However you have not provided an email or passowrd. Go to Project Settings -> SupabaseUser to fix."
      );
    
    //Sign in with email/password to get a token
    const { data, error } = await supabase.auth.signInWithPassword({
      email: simulateUserSettings.email,
      password: simulateUserSettings.password,
    });

    if (error) throw error;

    //Extract the token
    const token =  data?.session?.access_token;

    if(!token) throw new Error('Could not get token from Supabase for simulated user.')

    //Create a native supabase client (supabase-js instead of @supabase/ssr) which lets us set custom headers
    //Return that client for use in the studio
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          },
        },
      }
    );
  }
};

export default supabaseBrowserClient;
