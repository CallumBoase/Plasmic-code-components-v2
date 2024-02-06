import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";
import { DataProvider, PlasmicCanvasContext } from "@plasmicapp/loader-nextjs";
import { GlobalActionsProvider } from "@plasmicapp/host";
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Json } from "@/types/supabase";
import getErrMsg from "@/utils/getErrMsg";
import type { AuthTokenResponse } from "@supabase/supabase-js";

type User = {
  email: string | null;
  role: string | null;
  user_metadata: Json | null;
};

interface DataProviderData {
  user: User | null;
  error: string | null;
}

interface SupabaseUserComponentProps {
  children: React.ReactNode;
  redirectOnLoginSuccess?: string;
}

export const SupabaseUser = ({children, redirectOnLoginSuccess}: SupabaseUserComponentProps) => {

  //Nextjs router
  const router = useRouter();

  // //Determine if we are in the Plasmic studio
  // const inEditor = useContext(PlasmicCanvasContext) ? true : false;

  // try {
  //   window.localStorage.setItem('createdFromUserProvider', Math.random().toString());
  // } catch(err){}
  
  //Setup state
  const [session, setSession] = useState<AuthTokenResponse["data"]["session"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // const [simulateUserSettings, setSimulateUserSettings] = useState({
  //   simulateLoggedInUser: simulateLoggedInUser,
  //   email: email,
  //   password: password,
  // });

  //Update simulateUserSettings when props change
  // useEffect(() => {
  //   setSimulateUserSettings({
  //     simulateLoggedInUser: simulateLoggedInUser,
  //     email: email,
  //     password: password,
  //   });
  // }, [simulateLoggedInUser, email, password]);

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
    supabaseBrowserClient().then(async (supabase) => {

      console.log('initial load')
      
      // const { data, error } = await supabase.auth.getUser();
      const { data, error } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (error) {
        console.log('error in useEffect supabaseUserProvider')
        console.error(error);
        throw error;
      }

      console.log('INITIAL LOAD USER')
      console.log(user)

      console.log('INITIAL LOAD data')
      console.log(data);

      //Save the session to state
      // setSession({
      //   email: user?.email || null,
      //   role: user?.role || null,
      //   user_metadata: user?.user_metadata || null
      // });
      setSession(data?.session);

    }).catch((e) => {
      console.log('setting error message in useEffect')
      setError(getErrMsg(e))
    }) ;
  }, [])

  //Global actions that can be called from plasmic studio
  const actions = useMemo(
    () => ({
      //Login
      login: async (email: string, password: string) => {
        console.log('logging in...')
        try {
          const supabase = await supabaseBrowserClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            console.log('error in login')
            console.error(error);
            throw error;
          }
          
          //Save the session to state
          setSession(data?.session);
          
          //Save the access_token in localStorage
          //This helps us to log in when viewing the app in Plasmic Studio / Plasmic studio preview
          if(typeof window !== 'undefined') {
            // window.localStorage.setItem('sb-token-plasmic-saved', data?.session?.access_token);
            // window.localStorage.setItem('sb-session-plasmic-saved', JSON.stringify(data?.session));
            window.localStorage.setItem('sb-custom-storage-key', JSON.stringify(data?.session));
          }
          
          setError(null);
          if(redirectOnLoginSuccess && router) router.push(redirectOnLoginSuccess);
          
          return;

        } catch (e) {
          console.log('setting error message in login')
          setError(getErrMsg(e))
          return;
        }
      },
      //Logout
      logout: async () => {
        console.log('logging out...')
        try {
          const supabase = await supabaseBrowserClient();
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.log('error in logout')
            console.error(error);
            throw error;
          }
          // await getSessionAndSaveToState();

          //Remove session from state
          // setSession({
          //   email: null,
          //   role: null,
          //   user_metadata: null
          // })
          setSession(null);

          //Remove the access_token from localStorage
          if(typeof window !== 'undefined') {
            // window.localStorage.removeItem('sb-token-plasmic-saved');
            window.localStorage.removeItem('sb-session-plasmic-saved');
          }

          setError(null);
          return;
        } catch (e) {
          console.log('setting error message in logout')
          setError(getErrMsg(e))
          return;
        }
      },
    }),
    [redirectOnLoginSuccess, router]
  );
  
  //Setup the data that will be passed as global context to Plasmic studio
  const dataProviderData: DataProviderData = {
    user: session,
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
