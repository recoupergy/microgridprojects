import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Custom redirects run before Proxy. Any historical URL that is covered by
// next.config.ts therefore reaches its final replacement in one hop, while a
// surviving modern URL with a trailing slash is normalized here.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const destination = new URL(request.url);
    destination.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)"],
};
