import { type NextRequest, NextResponse } from "next/server";
// import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // return await updateSession(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all dashboard routes
  ],
};