// //MIDDLEWARE CURRENTLY DISABLED DUE TO CAUSING ISSUES AND NOT WORKING FOR AUTH REDIRECT / PROTECTING ROUTES

// import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {

//   // Getting the URL of the request
//   const url = request.nextUrl.clone();
    
//   // Logging the origin
//   console.log('Origin:', url.origin);

//   //Logging the cookies
//   console.log(request.cookies)

//   //https://supabase.com/docs/guides/auth/server-side/creating-a-client?environment=middleware
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   return response;

//   //If requested page was /plasmic-host, continue to the requested page
//   // if (request.nextUrl.pathname === "/plasmic-host") return response;

//   //For all other pages, see if the user is logged in, refreshing session if needed
//   // const supabase = createServerClient(
//   //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   //   {
//   //     cookies: {
//   //       get(name: string) {
//   //         return request.cookies.get(name)?.value;
//   //       },
//   //       set(name: string, value: string, options: CookieOptions) {
//   //         request.cookies.set({
//   //           name,
//   //           value,
//   //           ...options,
//   //         });
//   //         response = NextResponse.next({
//   //           request: {
//   //             headers: request.headers,
//   //           },
//   //         });
//   //       },
//   //       remove(name: string, options: CookieOptions) {
//   //         request.cookies.set({
//   //           name,
//   //           value: "",
//   //           ...options,
//   //         });
//   //         response = NextResponse.next({
//   //           request: {
//   //             headers: request.headers,
//   //           },
//   //         });
//   //       },
//   //     },
//   //   }
//   // );

//   //Retrieve the session from the request
//   // const { data } = await supabase.auth.getSession();

//   const isLoggedIn = data?.session?.user;
//   console.log('isLoggedIn')
//   console.log(isLoggedIn?.id)

//   if (request.nextUrl.pathname === "/login") {
//     //Login page
//     if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
//     return response;
//   } else {
//     //All other pages
//     if (!isLoggedIn)
//       return NextResponse.redirect(new URL("/login", request.url));
//     return response;
//   }
// }

// // // See "Matching Paths" below to learn more
// export const config = {
//   /*
//    * Match all request paths except for the ones starting with:
//    * - api (API routes)
//    * - _next/static (static files)
//    * - _next/image (image optimization files)
//    * - favicon.ico (favicon file)
//    */
//   matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
// };
