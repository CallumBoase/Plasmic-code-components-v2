import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// type SimulateUserSettings = {
//   simulateLoggedInUser: boolean;
//   email: string | null;
//   password: string | null;
// };

const supabaseBrowserClient = async () => {
  //Create the supabase client like normal
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: 'sb-custom-storage-key'
      }
    }
  );

  return supabase;

  //Determine whether we're returning normal supabase client
  //Or using email/password values from the App Settings -> UserProvider to simulate a logged in user while working in the studio
  //Reason this needed: the app is inside an iframe when working in a studio, meaning localStorage & cookies do not work
  //So if we want to view login-protected data while working in the studio, we must simulate a user this way
  
  // const shouldSimulate =
  //   process.env.NODE_ENV === "development" &&
  //   simulateUserSettings &&
  //   simulateUserSettings.simulateLoggedInUser ? true : false;

  //Check if there's an authenticated user via normal automatic methods
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.log('error in getSession')
    console.error(error);
    throw error;
  }
  
  //If there is an authenticated user, return the normal supabase client
  if (data.session) {
    console.log('There is an authenticated user. Return 1')
    console.log(data.session)
    return supabase;

  //If there's not, it could be because the user is logged out, or could be because we're in plasmic studio or preview
  } else {

    //Check we have all required values
    // if (
    //   !simulateUserSettings ||
    //   !simulateUserSettings.email ||
    //   !simulateUserSettings.password
    // )
    //   throw new Error(
    //     "You have elected to simulate a logged in user for studio development. However you have not provided an email or passowrd. Go to Project Settings -> SupabaseUser to fix."
    //   );
    
    //Sign in with email/password to get a token
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: simulateUserSettings.email,
    //   password: simulateUserSettings.password,
    // });

    // if (error) throw error;

    //Extract the token
    // const token =  data?.session?.access_token;

    console.log('no authenticated user.')

    //Try to get the token from localStorage (manually saved there by SupabaseUserProvider)
    // let token = null;
    let sessionFromLocalStorage = null;
    if(typeof window !== 'undefined') {
      // token = window.localStorage.getItem('sb-token-plasmic-saved')
      sessionFromLocalStorage = window.localStorage.getItem('sb-session-plasmic-saved')
    };

    // console.log('Token from localStorage is: ', token);
    console.log('Session from localStorage is: ', sessionFromLocalStorage);

    //If there's still not token, the user is truly not logged in, so return the normal supabase client
    // if(!token) {
    //   console.log('no token, return 2')
    //   return supabase;
    // }

    if(!sessionFromLocalStorage) {
      console.log('no session. Valid no logged in user. return 2')
      return supabase;
    }

    // console.log('There is a token, creating manual client... Returning 3....')
    console.log('There is a session, adding to supabsae client');

    //If there is a token, then we're in the Plasmic Studio or preview, so we can use the token to create a client
    //Here we create a supabase client using supabase-js instead of @supabase/ssr) which lets us set custom headers
    //Return that client
    // return createClient<Database>(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     global: {
    //       headers: {
    //         Authorization: `Bearer ${token}`
    //       },
    //     },
    //   }
    // );
    const { data: setSessionData, error: setSessionErr } = await supabase.auth.setSession(
      JSON.parse(sessionFromLocalStorage)
    );

    if(setSessionErr) {
      console.log('Error in setSession')
      console.error(setSessionErr);
      throw setSessionErr;
    }

    console.log('set session data')
    console.log(setSessionData)

    const {data: test} = await supabase.auth.getSession();
    console.log('test')
    console.log(test)

    return supabase;
  }
};

export default supabaseBrowserClient;
