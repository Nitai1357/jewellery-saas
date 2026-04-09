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

  // Agar request "localhost" ya tumhare default "vercel.app" se aa rahi hai, toh rok-tok mat karo
  if (
    hostname.includes('localhost') ||
    hostname.includes('jewellery-saas.vercel.app')
  ) {
    return NextResponse.next();
  }

  // 🔥 ASLI JADOO YAHAN HAI 🔥
  // Agar koi Custom Domain se aaya hai (e.g. www.maakalijewellery.com)
  // Toh usko chupchap background mein humare naye "/domain/..." wale page par bhej do
  return NextResponse.rewrite(new URL(`/domain/${hostname}${url.pathname}`, req.url));
}