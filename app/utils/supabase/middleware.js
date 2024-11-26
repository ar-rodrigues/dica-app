import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the current URL and query parameters
  const url = new URL(request.url);
  const userBi = url.searchParams.get('user');
  const passBi = url.searchParams.get('password');

  console.log('query', userBi, passBi);
  console.log(
    'credentials',
    process.env.POWERBI_USER,
    process.env.POWERBI_PASSWORD,
  );

  // Power BI API authentication
  const isPowerBiRoute = request.nextUrl.pathname.startsWith('/api/powerbi');
  const validPowerBiUser = process.env.POWERBI_USER;
  const validPowerBiPassword = process.env.POWERBI_PASSWORD;

  // Allowed pages including Power BI authentication
  const allowedPages = [
    '/',
    `/api/setups?user=${process.env.POWERBI_USER}&password=${process.env.POWERBI_PASSWORD}`,
    `/api/setups`, // Add Power BI route
  ];

  // // Power BI specific authentication
  // if (isPowerBiRoute) {
  //   // Check Power BI credentials
  //   if (
  //     !userBi ||
  //     !passBi ||
  //     userBi !== validPowerBiUser ||
  //     passBi !== validPowerBiPassword
  //   ) {
  //     return new NextResponse(
  //       JSON.stringify({ error: 'Unauthorized Power BI Access' }),
  //       {
  //         status: 401,
  //         headers: { 'Content-Type': 'application/json' },
  //       },
  //     );
  //   }
  // }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !allowedPages.includes(request.nextUrl.pathname)
  ) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url.toString());
  }

  return supabaseResponse;
}
