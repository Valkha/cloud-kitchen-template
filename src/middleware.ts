// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

// ─── Rate Limiters ────────────────────────────────────────────────────────────

const redis = Redis.fromEnv()

// Routes de paiement : 5 tentatives par minute par IP
const paymentRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:payment',
  analytics: true,
})

// Routes générales API : 30 requêtes par minute par IP
const generalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix: 'ratelimit:general',
  analytics: true,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIp(request: NextRequest): string {
  // Vercel injecte l'IP réelle dans ce header
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.floor((reset - Date.now()) / 1000)
  return new NextResponse('Trop de requêtes. Réessayez dans quelques instants.', {
    status: 429,
    headers: {
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    },
  })
}

// ─── Middleware principal ─────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request: { headers: request.headers } })

  // 1. RATE LIMITING sur les routes API (avant tout le reste)
  if (pathname.startsWith('/api')) {

    // Le webhook Stripe a sa propre auth (signature HMAC) — on ne rate-limite pas
    if (pathname === '/api/webhook') {
      return response
    }

    const ip = getIp(request)

    // Routes sensibles : paiement et remboursement
    const isPaymentRoute =
      pathname.startsWith('/api/create-payment-intent') ||
      pathname.startsWith('/api/refund-order')

    const limiter = isPaymentRoute ? paymentRatelimit : generalRatelimit
    const { success, reset } = await limiter.limit(ip)

    if (!success) {
      console.warn(`[rate-limit] ❌ IP bloquée : ${ip} sur ${pathname}`)
      return rateLimitResponse(reset)
    }

    return response
  }

  // 2. SKIP (Images, fichiers statiques)
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return response
  }

  // 3. ANALYSE DU CHEMIN
  const segments = pathname.split('/')
  const langInUrl = locales.find(l => segments[1] === l)

  // 🚩 ACTION : Si la langue manque (ex: /admin/menu)
  if (!langInUrl && pathname !== '/login') {
    const newUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    console.log(`🔄 Redirection auto : ${pathname} -> ${newUrl.pathname}`)
    return NextResponse.redirect(newUrl)
  }

  const currentLang = langInUrl || defaultLocale

  // 4. PROTECTION ADMIN (inchangée)
  if (pathname.includes('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return request.cookies.get(name)?.value },
          set(name, value, options) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL(`/${currentLang}/login`, request.url))
    }
  }

  return response
}

export const config = {
  // ✅ On retire l'exclusion "api" pour que le rate limiting s'applique
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
}