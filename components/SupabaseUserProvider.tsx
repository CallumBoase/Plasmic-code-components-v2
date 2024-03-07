import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { GlobalActionsProvider } from "@plasmicapp/host";
import { useState, useEffect, useMemo } from "react";
import supabaseBrowserClient from "@/utils/supabase/component";
import getErrMsg from "@/utils/getErrMsg";
import type { AuthTokenResponse } from "@supabase/supabase-js";

interface DataProviderData {
  user: AuthTokenResponse["data"]["user"] | null;
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
  const [user, setUser] = useState<AuthTokenResponse["data"]["user"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  //Helper function to get the user and save to state
  async function getUserAndSaveToState() {

    const supabase = supabaseBrowserClient();

    //Get the session from stored credentials (not from the server)
    let { data: getSessionData, error: getSessionError } = await supabase.auth.getSession();
    if (getSessionError) {
      throw getSessionError;
    }

    //If no session, set user to null
    if(!getSessionData.session) {
      setUser(null);
      setError(null)
      return;
    }

    //If there is a session, save the user to state
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
      throw error;
    }
    setUser(data?.user);

  }


  //On initial load, set the session to state
  useEffect(() => {
    getUserAndSaveToState();
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
          setUser(data?.session?.user);
          
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
          setUser(null);

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
    user,
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
