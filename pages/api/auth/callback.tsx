// callback enpoint to handle supabase email confirmations for various auth activities
import { type EmailOtpType } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/utils/supabase/api";

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}

export default async function handler(req : NextApiRequest, res : NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).appendHeader('Allow', 'GET').end()
    return
  }

  const queryParams = req.query
  const token_hash = stringOrFirstString(queryParams.token_hash)
  const type = stringOrFirstString(queryParams.type) // the type param is the type of supabase event [email/signup(deprecated), recovery, etc...]

  let next = '/error' // currently redirecting to a basic error page by default that doesn't specify the reason for the error or action the user should take.

  if (token_hash && type) {
    const supabase = createClient(req, res)
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })
    if (error) {
      console.error(error)
    } else {
      next = stringOrFirstString(queryParams.next) || '/' // the supabase email URL can be configured with a 'next' param to redirect the user. e.g. redirect to /changepassword once user session is created with OTP above
    }
  }

  res.redirect(next)
}