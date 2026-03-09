import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const CANONICAL_HOST = "www.qualibase.pl"

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? ""

  if (
    host &&
    host !== CANONICAL_HOST &&
    host !== "localhost" &&
    !host.startsWith("localhost:") &&
    !host.includes("vercel.app")
  ) {
    const url = new URL(request.url)
    url.protocol = "https"
    url.host = CANONICAL_HOST
    url.port = ""
    return NextResponse.redirect(url, 308)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only try to refresh if we have a session
  if (session) {
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
