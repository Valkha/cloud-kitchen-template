"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Store, Plus, Trash2, ExternalLink, Edit2, X,
  Loader2, Power, PowerOff, Globe, Search
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
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
  
  // État pour la modification
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
    const loadData = async () => {
      await fetchRestaurants();
    };
    loadData();
  }, [fetchRestaurants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalSlug = form.slug || form.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    try {
      if (editingId) {
        // ✅ On ajoute .select() pour obliger Supabase à nous renvoyer la ligne modifiée
        const { data, error } = await supabase
          .from("restaurants")
          .update({ name: form.name, slug: finalSlug })
          .eq("id", editingId)
          .select();

        if (error) throw error;
        
        // Si data est vide, c'est que le RLS a bloqué la modification silencieusement
        if (!data || data.length === 0) {
          alert("Modification bloquée (RLS). Assurez-vous d'être bien reconnu comme Admin en base de données.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // ✅ Même chose pour la création
        const { data, error } = await supabase
          .from("restaurants")
          .insert([{ name: form.name, slug: finalSlug, is_active: true }])
          .select();

        if (error) throw error;
        
        if (!data || data.length === 0) {
          alert("Création bloquée (RLS). Vérifiez vos droits d'administrateur.");
          setIsSubmitting(false);
          return;
        }
      }

      // Si tout s'est bien passé, on ferme et on rafraîchit
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ name: "", slug: "" });
      await fetchRestaurants(); 
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("Erreur de transaction:", err);
      alert("Une erreur technique est survenue : " + errorMessage);
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
    if (!confirm(`Supprimer définitivement "${name}" et TOUS ses produits ?`)) return;
    
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    
    if (error) {
      alert("Erreur suppression: " + error.message);
    } else {
      // ✅ Mise à jour de l'état local immédiate
      setRestaurants(prev => prev.filter(r => r.id !== id));
    }
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
            <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">
              Gestion <span className="text-kabuki-red">Plateforme</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">
              {restaurants.length} Enseignes actives
            </p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setForm({name:"", slug:""}); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-white text-black hover:bg-kabuki-red hover:text-white px-6 py-3 rounded-xl font-black transition-all shadow-xl uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> Ajouter une enseigne
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un restaurant..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-kabuki-red outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-kabuki-red" size={40} />
            </div>
          ) : filtered.map((resto) => (
            <m.div 
              layout
              key={resto.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-neutral-900 border rounded-[2.5rem] p-8 transition-all ${resto.is_active ? 'border-neutral-800' : 'border-red-900/20 opacity-60'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-kabuki-red border border-white/5">
                  <Store size={28} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(resto)} className="p-2 text-blue-400 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => toggleStatus(resto.id, resto.is_active)} className={`p-2 rounded-lg transition-colors ${resto.is_active ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-neutral-800'}`}>
                    {resto.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                  <button onClick={() => deleteRestaurant(resto.id, resto.name)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tight">{resto.name}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-mono text-xs">
                  <Globe size={12} /> /{resto.slug}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ✅ LIEN CORRIGÉ : On passe restaurantId en paramètre */}
                <TransitionLink 
                  href={`/${lang}/admin/menu?restaurantId=${resto.id}`}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase py-3 rounded-xl text-center transition-colors"
                >
                  Gérer Menu
                </TransitionLink>
                <a 
                  href={`/${lang}/menu?restaurant=${resto.slug}`} 
                  target="_blank"
                  className="bg-kabuki-red/10 hover:bg-kabuki-red text-kabuki-red hover:text-white text-[10px] font-black uppercase py-3 rounded-xl text-center transition-all flex items-center justify-center gap-2"
                >
                  Vue Client <ExternalLink size={12} />
                </a>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-neutral-800 p-8 rounded-[3rem] max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white">
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8 text-center italic">
                {editingId ? "Modifier l'enseigne" : "Nouveau Restaurant"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Nom de l&apos;enseigne</label>
                  <input required className="w-full bg-black border border-neutral-800 p-4 rounded-2xl outline-none focus:border-kabuki-red transition text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Burger Factory" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Slug URL (optionnel)</label>
                  <input className="w-full bg-black border border-neutral-800 p-4 rounded-2xl outline-none focus:border-kabuki-red transition text-gray-400 font-mono text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} placeholder="burger-factory" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-kabuki-red hover:text-white transition-all">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : (editingId ? "Enregistrer" : "Créer l'enseigne")}
                  </button>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}