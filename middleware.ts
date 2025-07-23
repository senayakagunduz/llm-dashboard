export {default} from "next-auth/middleware"

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/profile/:path*']
}