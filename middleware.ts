import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log('hello from middleware')
  // if(Math.random() > 0.5) {
    return NextResponse.next()
  
  // } else {
    // return NextResponse.redirect(new URL('/', request.url))
  // }
}
 
// // See "Matching Paths" below to learn more
export const config = {
  matcher: '/staff',
}