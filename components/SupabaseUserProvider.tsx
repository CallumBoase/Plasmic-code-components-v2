import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { GlobalActionsProvider } from "@plasmicapp/host";
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Json } from "@/types/supabase";
import getErrMsg from "@/utils/getErrMsg";
import type { AuthTokenResponse } from "@supabase/supabase-js";

interface DataProviderData {
  session: AuthTokenResponse["data"]["session"] | null;
  error: string | null;
}

interface SupabaseUserComponentProps {
  children: React.ReactNode;
  redirectOnLoginSuccess?: string;
}

export const SupabaseUser = ({children, redirectOnLoginSuccess}: SupabaseUserComponentProps) => {

  //Nextjs router
  const router = useRouter();
 
  //Setup state
  const [session, setSession] = useState<AuthTokenResponse["data"]["session"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  //Callback to get the logged in user's session
  // const getSession = useCallback(async () => {
  //   const supabase = await supabaseBrowserClient(simulateUserSettings);

  //   if (!simulateUserSettings.simulateLoggedInUser) {
  //     //If we are NOT simulating logged in user, get session from localStorage / cookies
  //     const { data, error } = await supabase.auth.getSession();
  //     if (error) throw error;
  //     return data;
  //   } else {
  //     //If we are simulating logged in user, sign in with email and password to get session instead
  //     //Reason: getSession() won't work because the Plasmic studio renders the app in an iframe
  //     const validFields =
  //       simulateUserSettings.email && simulateUserSettings.password;
  //     if (!validFields)
  //       throw new Error(
  //         "You must provide an email and password to simulate a logged in user (Project settings -> SupabaseUser)"
  //       );
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email: simulateUserSettings.email as string,
  //       password: simulateUserSettings.password as string,
  //     });
  //     if (error) throw error;
  //     return data;
  //   }
  // }, [simulateUserSettings]);

  //Callback to get the session and set state variable session to the result
  // const getSessionAndSaveToState = useCallback(async () => {
  //   try {
  //     const data = await getSession();
  //     setSession({
  //       email: data.session?.user.email || null,
  //       role: data.session?.user.role || null,
  //       user_metadata: data.session?.user.user_metadata || null
  //     });
  //     setError(null);
  //   } catch (e) {
  //     setError(getErrMsg(e))
  //     return;
  //   }
  // }, [getSession]);

  //Initially fetch the session and save as state
  // useEffect(() => {
  //   getSessionAndSaveToState();
  // }, [getSessionAndSaveToState]);

  //On initial load, set the session to state
  useEffect(() => {
    
    const supabase = supabaseBrowserClient();
      
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error(error);
        throw error;
      }
      setSession(data?.session);

    }).catch((e) => {
      setError(getErrMsg(e))
    }) ;
  }, [])

  //Global actions that can be called from plasmic studio
  const actions = useMemo(
    () => ({
      //Login
      login: async (email: string, password: string) => {
        try {
          const supabase = supabaseBrowserClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            throw error;
          }
          
          //Save the session to state
          setSession(data?.session);
          
          //Reset errors if present
          setError(null);

          //Redirect if needed
          if(redirectOnLoginSuccess && router) router.push(redirectOnLoginSuccess);
          
          return;

        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      //Logout
      logout: async () => {
        try {
          const supabase = supabaseBrowserClient();
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          //Reset the session in state
          setSession(null);

          //Reset errors if present
          setError(null);

          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
    }),
    [redirectOnLoginSuccess, router]
  );
  
  //Setup the data that will be passed as global context to Plasmic studio
  const dataProviderData: DataProviderData = {
    session,
    error,
  };

  //Render the actual components
  return (
    <GlobalActionsProvider
      contextName="SupabaseUserGlobalContext"
      actions={actions}
    >
      <DataProvider name="SupabaseUser" data={dataProviderData}>
        {children}
      </DataProvider>
    </GlobalActionsProvider>
  );
};
