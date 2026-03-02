// app/[lang]/admin/layout.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminHeader from './AdminHeader' 

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode,
  // ✅ CORRECTION 1 : params est maintenant une Promise dans Next.js
  params: Promise<{ lang: string }> 
}) {
  // ✅ On "déballe" la promise des params
  const { lang } = await params 
  
  // ✅ CORRECTION 2 : cookies() est asynchrone, il faut l'attendre
  const cookieStore = await cookies() 

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang || 'fr'}/login`)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* On appelle le composant d'interface client */}
      <AdminHeader lang={lang} />

      {/* --- ZONE DE CONTENU --- */}
      <main className="relative">
        <div className="fixed inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.02] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 px-4">
          {children}
        </div>
      </main>
    </div>
  )
}