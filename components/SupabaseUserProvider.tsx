// import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";
import { useRouter } from "next/router";
import { DataProvider, GlobalActionsProvider } from "@plasmicapp/host";
import { useState, useEffect, useCallback, useMemo, Component } from "react";
// import supabaseBrowserClient from "@/utils/supabaseBrowserClient"; // legacy import that adapted the supabaseBrowserClient to accept a "Simulated User" from the Plasmic Studio
import { createClient } from '../utils/supabase/component'
import getErrMsg from "../utils/getErrMsg";

type User = {
  email: string | null;
  role: string | null;
  user_metadata: Json | null;
};

interface DataProviderData {
  user: User | null;
  simulateUserSettings: {
    simulateLoggedInUser: boolean;
    email: string | null;
    password: string | null;
  };
  error: string | null;
}

interface SupabaseUserComponentProps {
  children: React.ReactNode;
  redirectOnLoginSuccess?: string;
  simulateLoggedInUser: boolean;
  email: string | null;
  password: string | null;
}

export const SupabaseUser = ({children, redirectOnLoginSuccess, simulateLoggedInUser, email, password} : SupabaseUserComponentProps) => {

  //Nextjs router
  const router = useRouter();
  
  //Setup state
  const [session, setSession] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [simulateUserSettings, setSimulateUserSettings] = useState({
    simulateLoggedInUser: simulateLoggedInUser,
    email: email,
    password: password,
  });

  //Update simulateUserSettings when props change
  useEffect(() => {
    setSimulateUserSettings({
      simulateLoggedInUser: simulateLoggedInUser,
      email: email,
      password: password,
    });
  }, [simulateLoggedInUser, email, password]);

  //Callback to get the logged in user's session
  const getSession = useCallback(async () => {
    const supabase = createClient();

    if (!simulateUserSettings.simulateLoggedInUser) {
      //If we are NOT simulating logged in user, get session from localStorage / cookies
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } else {
      //If we are simulating logged in user, sign in with email and password to get session instead
      //Reason: getSession() won't work because the Plasmic studio renders the app in an iframe
      const validFields =
        simulateUserSettings.email && simulateUserSettings.password;
      if (!validFields)
        throw new Error(
          "You must provide an email and password to simulate a logged in user (Project settings -> SupabaseUser)"
        );
      const { data, error } = await supabase.auth.signInWithPassword({
        email: simulateUserSettings.email as string,
        password: simulateUserSettings.password as string,
      });
      if (error) throw error;
      return data;
    }
  }, [simulateUserSettings]);

  //Callback to get the session and set state variable session to the result
  const getSessionAndSaveToState = useCallback(async () => {
    try {
      const data = await getSession();
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null,
      });
      setError(null);
    } catch (e) {
      setError(getErrMsg(e))
      return;
    }
  }, [getSession]);

  //Initially fetch the session and save as state
  useEffect(() => {
    getSessionAndSaveToState();
  }, [getSessionAndSaveToState]);

  //Global actions that can be called from plasmic studio
  const actions = useMemo(
    () => ({
      //Login
      login: async (email: string, password: string) => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          await getSessionAndSaveToState();
          setError(null);
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
          const supabase = createClient();
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          await getSessionAndSaveToState();
          setError(null);
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      //signUp
      signup: async (email: string, password: string) => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signUp({ 
            email, 
            password 
          });
          if (error) throw error;
          await getSessionAndSaveToState();
          setError(null);
          // There is potential to include a signup redirect here that would redirect to a page provided in an action parameter
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      //resetPassword
      resetPasswordForEmail: async (email: string) => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.resetPasswordForEmail(
            email // this auth function takes its parameters slightly differently. It doesn't accept named parameters like the other supabase.auth functions.
          );
          if (error) throw error;
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      // Update User Password
        // This action/function assumes the user has an active session (either by having "Logged in" or clicking the password reset confirmation from a recovery email)
        // Currently this can be used by any authenticated user to change their password without having to re-enter their exisiting password
        // There is likely a more robust way to perform this - 
        // i.e. requiring an expiring token to be passed in the /changepassword URL, validating the token against the supabase DB, only displaying the page if the toekn was valid, otherwise redirect
      updateUserPassword: async (password: string) => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.updateUser({
            password: password
          });
          if (error) throw error;
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
    }),
    [getSessionAndSaveToState, redirectOnLoginSuccess, router]
  );
  
  //Setup the data that will be passed as global context to Plasmic studio
  const dataProviderData: DataProviderData = {
    user: session,
    simulateUserSettings: {
      simulateLoggedInUser: simulateLoggedInUser,
      email: email,
      password: password,
    },
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