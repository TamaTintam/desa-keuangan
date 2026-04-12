// GANTI dari:
// import { updateSession } from "@/lib/supabase/middleware";
// import { createClient } from "@/lib/supabase/server";

// JADI:
import { updateSession } from "./lib/supabase/middleware";
import { createClient } from "./lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
