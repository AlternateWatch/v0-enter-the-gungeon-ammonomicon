import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = await updateSession(request)

    // Get the supabase client to check auth
    const { createServerClient } = await import("@supabase/ssr")
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for read-only check
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user, redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
