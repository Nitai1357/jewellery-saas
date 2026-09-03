import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Matcher ka matlab: Kin pages par traffic police khadi karni hai.
     * Hum static files, images, aur api ko chhod kar sab par lagayenge.
     */
    '/((?!api/|_next/|_static/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 🔥 YAHAN KARI HAI HUMNE SETTING 🔥
  // Agar request localhost, vercel app, ya tumhare MAIN DOMAIN se aaye, toh rok-tok mat karo
  if (
    hostname.includes('localhost') ||
    hostname.includes('jewellery-saas.vercel.app') ||
    hostname === 'karattech.in' ||
    hostname === 'www.karattech.in'
  ) {
    return NextResponse.next();
  }

  // Agar koi aur Client ka Custom Domain se aaya hai (e.g. www.maakalijewellery.com)
  // Toh usko chupchap background mein humare naye "/domain/..." wale page par bhej do
  return NextResponse.rewrite(new URL(`/domain/${hostname}${url.pathname}`, req.url));
}