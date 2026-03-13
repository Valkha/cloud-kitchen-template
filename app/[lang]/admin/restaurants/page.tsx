"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Store, Plus, Trash2, ExternalLink, Edit2, X,
  Loader2, Power, PowerOff, Globe, Search
} from "lucide-react";
// ✅ Correction : Changement de 'm' en 'motion' pour garantir l'affichage
import { motion, AnimatePresence } from "framer-motion";
import TransitionLink from "@/components/TransitionLink";
import { useParams } from "next/navigation";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export default function PlatformRestaurantsPage() {
  const supabase = useMemo(() => createClient(), []);
  const params = useParams();
  const lang = typeof params.lang === 'string' ? params.lang : 'fr';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Erreur fetch:", error.message);
    if (data) setRestaurants(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalSlug = form.slug || form.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("restaurants")
          .update({ name: form.name, slug: finalSlug })
          .eq("id", editingId)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Modification bloquée (RLS)");
      } else {
        const { data, error } = await supabase
          .from("restaurants")
          .insert([{ name: form.name, slug: finalSlug, is_active: true }])
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Création bloquée (RLS)");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm({ name: "", slug: "" });
      await fetchRestaurants(); 
      
    } catch (err: unknown) {
      // ✅ On vérifie si 'err' est bien une instance d'Error pour accéder à .message
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      console.error("Erreur de transaction:", err);
      alert("Erreur : " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (resto: Restaurant) => {
    setEditingId(resto.id);
    setForm({ name: resto.name, slug: resto.slug });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
    }
  };

  const deleteRestaurant = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (!error) setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
              Gestion <span className="text-brand-primary">Plateforme</span>
            </h1>
            <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-black">
              {restaurants.length} Enseignes actives
            </p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setForm({name:"", slug:""}); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-white text-black hover:bg-brand-primary hover:text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl uppercase text-[10px] tracking-widest cursor-pointer"
          >
            <Plus size={20} /> Ajouter une enseigne
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un restaurant..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-5 pl-14 pr-4 text-white focus:border-brand-primary outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
            </div>
          ) : filtered.map((resto) => (
            // ✅ Utilisation de motion.div pour corriger l'invisibilité
            <motion.div 
              layout
              key={resto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-neutral-900 border rounded-[2.5rem] p-8 transition-all group ${resto.is_active ? 'border-neutral-800' : 'border-red-900/20 opacity-60'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-brand-primary border border-white/5 group-hover:scale-110 transition-transform">
                  <Store size={32} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(resto)} className="p-3 text-blue-400 bg-blue-400/10 rounded-xl hover:bg-blue-400/20 transition-colors cursor-pointer">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => toggleStatus(resto.id, resto.is_active)} className={`p-3 rounded-xl transition-colors cursor-pointer ${resto.is_active ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-neutral-800'}`}>
                    {resto.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                  <button onClick={() => deleteRestaurant(resto.id, resto.name)} className="p-3 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-10">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">{resto.name}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                  <Globe size={12} /> /{resto.slug}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TransitionLink 
                  href={`/${lang}/admin/menu?restaurantId=${resto.id}`}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase py-4 rounded-2xl text-center transition-colors cursor-pointer"
                >
                  Gérer Menu
                </TransitionLink>
                <a 
                  href={`/${lang}/menu?restaurant=${resto.slug}`} 
                  target="_blank"
                  className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-[10px] font-black uppercase py-4 rounded-2xl text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Vue Client <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-neutral-800 p-10 rounded-[3rem] max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white cursor-pointer">
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-center italic text-white">
                {editingId ? "Modifier l'enseigne" : "Nouveau Restaurant"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-3 ml-1">Nom de l&apos;enseigne</label>
                  <input required className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-black uppercase text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Burger Factory" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-3 ml-1">Slug URL (optionnel)</label>
                  <input className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-gray-400 font-bold text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} placeholder="burger-factory" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 cursor-pointer">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all cursor-pointer">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : (editingId ? "Enregistrer" : "Créer l'enseigne")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}