"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Edit2, Trash2, Plus, X, Upload, Loader2, 
  CheckCircle2, AlertCircle, Wand2, 
  PowerOff, RefreshCw, Power, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
// ✅ Correction : Import de siteConfig ajouté
import { siteConfig } from "@/config/site";

interface MenuItem {
  id: string; 
  restaurant_id: string;
  category_id: string | null;
  name_fr: string;
  name_en: string;
  name_es: string;
  price: number; 
  description_fr: string;
  description_en: string;
  description_es: string;
  image_url: string;
  is_available: boolean; 
  category_name?: string; 
}

// ✅ Correction : Interface pour le retour de jointure Supabase
interface RawProduct extends MenuItem {
  categories: { name_fr: string } | null;
}

interface Category {
  id: string;
  name_fr: string;
}

export default function AdminMenu() {
  const supabase = useMemo(() => createClient(), []);
  const { lang } = useTranslation(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const targetRestaurantId = searchParams.get('restaurantId');
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [restaurantName, setRestaurantName] = useState<string>(""); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null); 
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [form, setForm] = useState<Omit<MenuItem, 'id' | 'is_available' | 'restaurant_id' | 'category_name'>>({
    name_fr: "", name_en: "", name_es: "",
    price: 0, 
    category_id: "", 
    description_fr: "", description_en: "", description_es: "",
    image_url: ""
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchMenuData = useCallback(async () => {
    if (!targetRestaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: resto, error: restoError } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', targetRestaurantId)
        .single();
        
      if (restoError || !resto) throw new Error("Restaurant introuvable");
      setRestaurantName(resto.name);

      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('id, name_fr')
        .eq('restaurant_id', targetRestaurantId) 
        .order('order', { ascending: true });
        
      if (!catsError && cats) setCategories(cats);

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`*, categories (name_fr)`)
        .eq('restaurant_id', targetRestaurantId)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      
      if (products) {
        // ✅ Correction : Typage explicite au lieu de any
        const formattedProducts = (products as RawProduct[]).map((p) => ({
          ...p,
          category_name: p.categories?.name_fr || 'Sans catégorie'
        }));
        setItems(formattedProducts as MenuItem[]);
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Erreur lors du chargement";
      showToast(err, 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase, showToast, targetRestaurantId]); 

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  if (!targetRestaurantId) {
    return (
      <div className="p-4 md:p-10 bg-black min-h-screen text-white pt-24 md:pt-32 flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-brand-primary mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Aucun restaurant sélectionné</h1>
        <p className="text-gray-500 mb-8 max-w-md text-sm uppercase tracking-widest font-bold">Veuillez choisir un restaurant pour gérer son menu.</p>
        <TransitionLink href={`/${lang}/admin/restaurants`} className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition cursor-pointer">
          Retour aux enseignes
        </TransitionLink>
      </div>
    );
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("products") 
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (error) {
      showToast("Erreur de mise à jour", "error");
    } else {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_available: !currentStatus } : item
      ));
      showToast(!currentStatus ? "Produit activé" : "Produit marqué comme épuisé");
    }
    setUpdatingId(null);
  };

  const handleTranslate = async () => {
    if (!form.name_fr && !form.description_fr) {
      showToast("Remplissez d'abord le Français", 'error');
      return;
    }
    setIsTranslating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setForm(prev => ({
        ...prev,
        name_en: prev.name_en || prev.name_fr,
        name_es: prev.name_es || prev.name_fr,
        description_en: prev.description_en || prev.description_fr,
        description_es: prev.description_es || prev.description_fr
      }));
      showToast("Suggestions générées !");
    } finally {
      setIsTranslating(false);
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('restaurant-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('restaurant-assets').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      showToast("Image mise à jour !");
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Erreur lors du transfert";
      showToast(err, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetRestaurantId) return showToast("Erreur: Restaurant non identifié", "error");
    
    setActionLoading(true);
    const productData = { 
      ...form, 
      price: Number(form.price), 
      restaurant_id: targetRestaurantId, 
      category_id: form.category_id || null 
    };
    
    try {
      if (editingId) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingId);
        if (error) throw error;
        showToast("Plat modifié !");
      } else {
        const { error } = await supabase.from("products").insert([{ ...productData, is_available: true }]);
        if (error) throw error;
        showToast("Nouveau plat ajouté !");
      }
      setIsModalOpen(false);
      resetForm();
      fetchMenuData(); 
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Erreur lors de l'enregistrement";
      showToast(err, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Supprimer définitivement "${name}" ?`)) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        setItems(prev => prev.filter(i => i.id !== id));
        showToast("Produit supprimé.");
      } catch (error: unknown) {
        const err = error instanceof Error ? error.message : "Erreur lors de la suppression";
        showToast(err, 'error');
      }
    }
  }

  const resetForm = () => {
    setForm({ 
      name_fr: "", name_en: "", name_es: "", price: 0, 
      category_id: categories.length > 0 ? categories[0].id : "", 
      description_fr: "", description_en: "", description_es: "", image_url: "" 
    });
    setEditingId(null);
  };

  const openEditModal = (item: MenuItem) => {
    setForm({ 
      ...item, 
      price: item.price, 
      category_id: item.category_id || "",
      name_en: item.name_en || "", 
      name_es: item.name_es || "", 
      description_en: item.description_en || "", 
      description_es: item.description_es || "",
      image_url: item.image_url || ""
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) =>
    item.name_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white pt-24 md:pt-32">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed bottom-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-neutral-900/90 border-green-500/50 text-green-400' : 'bg-neutral-900/90 border-red-500/50 text-red-400'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10 flex items-center gap-6 border-b border-neutral-800 pb-8">
          <button onClick={() => router.push(`/${lang}/admin/restaurants`)} className="p-3 bg-neutral-900 rounded-2xl hover:bg-brand-primary group transition cursor-pointer">
            <ArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
          </button>
          <div>
            <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Gestion du Menu</h2>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">{restaurantName}</h1>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white px-8 py-4 rounded-2xl font-black transition shadow-xl shadow-brand-primary/20 uppercase text-[10px] tracking-widest ml-auto cursor-pointer">
             <Plus size={20} /> Nouveau Plat
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un plat ou une catégorie..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-5 pl-14 pr-4 text-white focus:border-brand-primary outline-none shadow-xl transition-all font-bold" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={40} />
              <p className="italic uppercase text-[10px] font-black tracking-[0.3em] text-gray-500">Chargement du menu...</p>
            </div>
          ) : items.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-500">
                <AlertCircle size={40} className="text-neutral-700" />
                <p className="uppercase text-xs font-black tracking-[0.2em]">Aucun plat enregistré pour cet établissement.</p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-800/30 text-gray-500 uppercase text-[10px] font-black tracking-[0.3em]">
                  <tr>
                    <th className="p-6">Produit</th>
                    <th className="p-6 text-center">Catégorie</th>
                    <th className="p-6 text-center">Statut</th>
                    <th className="p-6 text-center">Tarif</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`transition-colors group ${!item.is_available ? 'bg-red-900/5 opacity-60' : 'hover:bg-white/[0.02]'}`}>
                      <td className="p-6 flex items-center gap-5">
                        <div className="relative w-14 h-14 shrink-0">
                          <Image 
                            src={item.image_url || "/placeholder-sushi.jpg"} 
                            alt={item.name_fr} 
                            fill 
                            className={`rounded-2xl object-cover bg-neutral-800 border border-white/5 shadow-lg group-hover:scale-105 transition-transform ${!item.is_available ? 'grayscale' : ''}`} 
                          />
                        </div>
                        <div>
                          <div className="font-black text-white uppercase tracking-wide text-sm">{item.name_fr}</div>
                          <div className="text-[10px] text-gray-500 line-clamp-1 italic uppercase tracking-wider mt-1">{item.description_fr}</div>
                        </div>
                      </td>
                      <td className="p-6 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.category_name}</td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => toggleAvailability(item.id, item.is_available)} 
                          disabled={updatingId === item.id} 
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border cursor-pointer ${item.is_available ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"}`}
                        >
                          {updatingId === item.id ? <RefreshCw size={12} className="animate-spin" /> : item.is_available ? <><Power size={12} /> Disponible</> : <><PowerOff size={12} /> Épuisé</>}
                        </button>
                      </td>
                      <td className="p-6 text-center font-display font-black text-brand-primary text-base">{Number(item.price).toFixed(2)} <span className="text-[10px]">{siteConfig.currency}</span></td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition cursor-pointer border border-white/5"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.name_fr)} className="p-3 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-xl transition cursor-pointer border border-white/5"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-neutral-900 border border-neutral-800 p-8 md:p-12 rounded-[3rem] max-w-5xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-10 border-b border-neutral-800 pb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? "Modifier" : "Ajouter un plat"}</h2>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition disabled:opacity-50 cursor-pointer hover:bg-brand-primary hover:text-white">
                    {isTranslating ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />} Auto-Traduction
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition cursor-pointer"><X size={24} /></button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Nom (FR)</label><input className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-bold" value={form.name_fr} onChange={e => setForm({...form, name_fr: e.target.value})} required /></div>
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Nom (EN)</label><input className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-bold" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} /></div>
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Nom (ES)</label><input className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-bold" value={form.name_es} onChange={e => setForm({...form, name_es: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Prix ({siteConfig.currency})</label><input type="number" step="0.05" className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-bold" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required /></div>
                  <div>
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Catégorie</label>
                    <select className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary transition text-white font-bold cursor-pointer" value={form.category_id || ""} onChange={e => setForm({...form, category_id: e.target.value})} required>
                      <option value="" disabled>Sélectionner une catégorie...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Desc (FR)</label><textarea className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary h-32 transition text-white font-bold" value={form.description_fr} onChange={e => setForm({...form, description_fr: e.target.value})} /></div>
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Desc (EN)</label><textarea className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary h-32 transition text-white font-bold" value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} /></div>
                  <div><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-3 block ml-1">Desc (ES)</label><textarea className="w-full bg-black border border-neutral-800 p-5 rounded-2xl outline-none focus:border-brand-primary h-32 transition text-white font-bold" value={form.description_es} onChange={e => setForm({...form, description_es: e.target.value})} /></div>
                </div>

                <div className="border-2 border-dashed border-neutral-800 p-10 rounded-[2.5rem] text-center hover:border-brand-primary transition-colors group relative bg-black/20">
                  {form.image_url ? (
                    <div className="relative inline-block">
                      <Image src={form.image_url} alt="Aperçu" width={200} height={150} className="rounded-2xl object-cover shadow-2xl border border-white/10" />
                      <button type="button" onClick={() => setForm(prev => ({...prev, image_url: ""}))} className="absolute -top-3 -right-3 bg-red-600 rounded-full p-2 text-white shadow-lg hover:bg-red-500 transition-colors cursor-pointer"><X size={16}/></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-4 text-gray-600 group-hover:text-brand-primary transition-colors" size={32} />
                      <label htmlFor="image-upload-admin" className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                        {uploading ? "Transfert en cours..." : "Téléverser une photographie"}
                      </label>
                      <input id="image-upload-admin" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </>
                  )}
                </div>

                <button type="submit" disabled={actionLoading || uploading || isTranslating} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50 cursor-pointer">
                  {actionLoading ? <Loader2 className="animate-spin" size={24} /> : (editingId ? "Enregistrer les modifications" : "Ajouter au menu")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}