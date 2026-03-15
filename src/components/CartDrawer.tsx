"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, 
  Clock, Calendar, MessageSquare, Loader2, CheckCircle, 
  ShieldCheck, MapPin, Tag, Store, Rocket 
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client"; 
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { useUser } from "@/context/UserContext";
import { submitOrder } from "@/services/orderService";
import { siteConfig } from "@/config/site";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type TranslationKeys = typeof cartTranslations.fr;

const cartTranslations = {
  fr: {
    titleCart: "Mon Panier", titleCheckout: "Validation", titlePayment: "Paiement Sécurisé", emptyCart: "Votre panier est vide", items: "article", itemsPlural: "articles", clearCart: "Vider le panier", name: "Nom Complet *", namePlaceholder: "Jean Dupont", phone: "Téléphone Mobile *", phonePlaceholder: "07X XXX XX XX", date: "Date *", time: "Heure *", pickupMode: "Mode de retrait *", takeaway: "À Emporter", delivery: "Livraison", address: "Adresse *", addressPlaceholder: "Rue des Alpes 12", zip: "NPA *", floor: "Étage", floorPlaceholder: "Ex: 4", code: "Code", codePlaceholder: "Ex: A123", comments: "Instructions / Allergies", commentsPlaceholder: "Sans wasabi...", totalEstimated: "Total à payer", btnValidate: "Passer à la caisse", btnPay: "Payer la commande", minOrderError: "Minimum 25 CHF requis pour la livraison.", noTimeSlots: "Aucun horaire disponible.", today: "Aujourd'hui", tomorrow: "Demain", sending: "Génération...", processing: "Traitement...", paymentError: "Le paiement a échoué.", successTitle: "Paiement réussi !", successDesc: "Votre commande est validée.", btnClose: "Fermer", cancelPayment: "Annuler", remove: "Supprimer", decrease: "Diminuer quantité", increase: "Augmenter quantité", back: "Retour",
    couponLabel: "Code Promo", couponPlaceholder: "EX: PLANET10", couponBtn: "Appliquer", couponInvalid: "Code invalide ou expiré", couponMinError: "Min. {min} CHF requis", discount: "Réduction", preparedBy: "Cuisiné par", cashbackNotice: "crédités sur votre cagnotte !"
  },
  en: {
    titleCart: "My Cart", titleCheckout: "Checkout", titlePayment: "Secure Payment", emptyCart: "Empty", items: "item", itemsPlural: "items", clearCart: "Clear", name: "Name *", namePlaceholder: "John Doe", phone: "Mobile Phone *", phonePlaceholder: "07X XXX XX XX", date: "Date *", time: "Time *", pickupMode: "Method *", takeaway: "Takeaway", delivery: "Delivery", address: "Address *", addressPlaceholder: "Street", zip: "ZIP *", floor: "Floor", floorPlaceholder: "Ex: 4", code: "Code", codePlaceholder: "Ex: A123", comments: "Instructions", commentsPlaceholder: "Allergies...", totalEstimated: "Total", btnValidate: "Checkout", btnPay: "Pay Now", minOrderError: "Min 25 CHF for delivery.", noTimeSlots: "No slots.", today: "Today", tomorrow: "Tomorrow", sending: "Sending...", processing: "Processing...", paymentError: "Failed.", successTitle: "Success!", successDesc: "Confirmed.", btnClose: "Close", cancelPayment: "Cancel", remove: "Remove", decrease: "Decrease", increase: "Increase", back: "Back",
    couponLabel: "Promo Code", couponPlaceholder: "EX: PLANET10", couponBtn: "Apply", couponInvalid: "Invalid or expired", couponMinError: "Min. {min} CHF required", discount: "Discount", preparedBy: "Prepared by", cashbackNotice: "credited to your wallet!"
  },
  es: {
    titleCart: "Carrito", titleCheckout: "Pago", titlePayment: "Pago Seguro", emptyCart: "Vacío", items: "artículo", itemsPlural: "artículos", clearCart: "Vaciar", name: "Nombre *", namePlaceholder: "Juan", phone: "Teléfono *", phonePlaceholder: "07X XXX XX XX", date: "Date *", time: "Hora *", pickupMode: "Método *", takeaway: "Para llevar", delivery: "Entrega", address: "Dirección *", addressPlaceholder: "Calle", zip: "CP *", floor: "Piso", floorPlaceholder: "Ej: 4", code: "Código", codePlaceholder: "Ej: A123", comments: "Notas", commentsPlaceholder: "Alergias...", totalEstimated: "Total", btnValidate: "Pagar", btnPay: "Pagar pedido", minOrderError: "Mínimo 25 CHF para entrega.", noTimeSlots: "No disponible.", today: "Hoy", tomorrow: "Mañana", sending: "Enviando...", processing: "Procesando...", paymentError: "Error.", successTitle: "¡Éxito!", successDesc: "Confirmado.", btnClose: "Cerrar", cancelPayment: "Cancelar", remove: "Eliminar", decrease: "Disminuir", increase: "Aumentar", back: "Volver",
    couponLabel: "Código Promo", couponPlaceholder: "EJ: PLANET10", couponBtn: "Aplicar", couponInvalid: "Inválido o expirado", couponMinError: "Min. {min} CHF requerido", discount: "Descuento", preparedBy: "Cocinado por", cashbackNotice: "abonados en tu monedero!"
  }
};

interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
}

interface CartDrawerProps { isOpen: boolean; onClose: () => void; }
interface StripeCheckoutFormProps { total: number; onSuccess: () => void; onCancel: () => void; t: TranslationKeys; orderId: string; }

function StripeCheckoutForm({ total, onSuccess, onCancel, t }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage("");

    const response = await stripe.confirmPayment({ elements, redirect: "if_required" });

    if (response.error) {
      setErrorMessage(response.error.message ?? t.paymentError);
      setIsProcessing(false);
    } else if (response.paymentIntent && response.paymentIntent.status === "succeeded") {
      onSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex items-center gap-4 text-green-500">
          <ShieldCheck size={28} aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-widest">Paiement 100% Sécurisé</p>
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
        {errorMessage && <div role="alert" className="text-red-500 text-xs font-bold bg-red-900/20 p-4 rounded-xl border border-red-500/30">⚠️ {errorMessage}</div>}
      </div>
      <div className="p-8 border-t border-neutral-800 bg-neutral-900 space-y-4">
        <button type="submit" disabled={!stripe || isProcessing} className={`w-full font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all cursor-pointer ${isProcessing ? "bg-neutral-800 text-neutral-500" : "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:bg-green-500"}`}>
          {isProcessing ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t.processing}</> : `${t.btnPay} (${total.toFixed(2)} CHF)`}
        </button>
        <button type="button" onClick={onCancel} className="w-full text-gray-500 text-[10px] font-black uppercase tracking-widest py-3 hover:text-white transition cursor-pointer">{t.cancelPayment}</button>
      </div>
    </form>
  );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const supabase = createClient();
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart, totalItems } = useCart();
  const { lang } = useTranslation();
  const t = (cartTranslations[lang as keyof typeof cartTranslations] || cartTranslations.fr) as TranslationKeys;

  const { user, profile } = useUser(); 
  const [useWallet, setUseWallet] = useState(false); 
  const [isCheckout, setIsCheckout] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(""); // ✅ NOUVEAU: État pour l'erreur de commande
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => {};
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.restaurant_id;
      if (!acc[key]) {
        acc[key] = {
          name: item.restaurant_name || "Restaurant",
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { name: string; items: typeof items }>);
  }, [items]);

  const [formData, setFormData] = useState({ 
    name: profile?.full_name || "", 
    phone: profile?.phone || "",     
    type: "Click & Collect", 
    address: "", 
    zip: "", 
    floor: "", 
    doorCode: "", 
    comments: "" 
  });
  
  const days = [];
  const start = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 1) days.push(d); 
  }
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(days[0]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const availableSlots = selectedDate ? (() => {
    const day = selectedDate.getDay();
    const slots = (day >= 2 && day <= 5) ? ["11:30", "12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"] : ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
    const now = new Date();
    if (selectedDate.toDateString() === now.toDateString()) {
      const cur = now.getHours() + now.getMinutes() / 60;
      return slots.filter(s => { const [h, m] = s.split(':').map(Number); return (h + m / 60) > (cur + 0.5); });
    }
    return slots;
  })() : [];

  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discount_type === 'percentage' ? (totalPrice * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value)
    : 0;
  
  const priceAfterCoupon = Math.max(0, totalPrice - discountAmount);
  
  let walletUsed = 0;
  if (useWallet && profile?.wallet_balance && profile.wallet_balance > 0) {
    walletUsed = Math.min(priceAfterCoupon, profile.wallet_balance);
  }

  const finalPrice = priceAfterCoupon - walletUsed;
  const earnedCashback = finalPrice * 0.05;

  useEffect(() => {
    if (appliedCoupon && totalPrice < appliedCoupon.min_order_amount) {
      setAppliedCoupon(null);
      setCouponError(t.couponMinError.replace("{min}", appliedCoupon.min_order_amount.toString()));
    }
  }, [totalPrice, appliedCoupon, t.couponMinError]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsVerifyingCoupon(true);
    setCouponError("");
    const { data, error } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase().trim()).eq('is_active', true).single();
    if (error || !data) { setCouponError(t.couponInvalid); setAppliedCoupon(null); }
    else if (totalPrice < data.min_order_amount) { setCouponError(t.couponMinError.replace("{min}", data.min_order_amount.toString())); setAppliedCoupon(null); }
    else { setAppliedCoupon(data); setCouponCode(""); }
    setIsVerifyingCoupon(false);
  };

  const isGenevaZip = (zip: string) => /^12\d{2}$/.test(zip.trim());
  const isDeliveryValid = formData.type !== "Livraison" || (totalPrice >= 25 && formData.address.trim() !== "" && isGenevaZip(formData.zip));
  const isFormReady = selectedDate && selectedTime !== "" && formData.name.trim() !== "" && formData.phone.trim() !== "" && isDeliveryValid;

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady) return;
    
    setIsSubmitting(true);
    setCheckoutError(""); // ✅ Réinitialisation de l'erreur à chaque nouvelle tentative

    try {
      const orderResult = await submitOrder(
        siteConfig.restaurantSlug,
        {
          name: formData.name,
          email: user?.email || "guest@example.com", 
          phone: formData.phone,
          special_instructions: `${formData.type} | Date: ${selectedDate?.toISOString().split('T')[0]} ${selectedTime} | Addresse: ${formData.address} ${formData.zip} | Commentaire: ${formData.comments}`
        },
        items,
        finalPrice
      );

      // ✅ Utilisation du vrai message d'erreur si la création échoue
      if (!orderResult.success || !orderResult.orderId) {
        throw new Error(
          orderResult.error instanceof Error 
            ? orderResult.error.message 
            : "Impossible de communiquer avec la base de données."
        );
      }
      
      const supabaseOrderId = orderResult.orderId;

      const res = await fetch("/api/create-payment-intent", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          amount: finalPrice, 
          couponCode: appliedCoupon?.code,
          useWallet: useWallet,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, restaurant_id: i.restaurant_id })),
          customerName: formData.name,
          customerPhone: formData.phone,
          pickupDate: selectedDate?.toISOString().split('T')[0],
          pickupTime: selectedTime,
          orderType: formData.type,
          databaseOrderId: supabaseOrderId 
        }) 
      });
      
      const payData = await res.json();
      if (payData.error) throw new Error(payData.error);
      
      setOrderId(supabaseOrderId);
      setClientSecret(payData.clientSecret);
      setIsPayment(true);

    } catch (err: unknown) {
      // ✅ On remplace l'alert() bloquant par une mise à jour d'état locale
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue lors de la création de votre commande.";
      setCheckoutError(errorMsg);
      console.error("Échec de la validation :", errorMsg);
    } finally { 
      setIsSubmitting(false); // ✅ Ceci s'exécutera toujours maintenant, arrêtant le spinner !
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]" 
            aria-hidden="true" 
          />
          
          {/* DRAWER */}
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-neutral-900 border-l border-white/10 z-[9999] flex flex-col shadow-2xl" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="cart-title"
          >
            {!isSuccess && (
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
                <h2 id="cart-title" className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
                  {isPayment ? (
                    <><ShieldCheck size={20} className="text-green-500" /> {t.titlePayment}</>
                  ) : isCheckout ? (
                    <><button onClick={() => setIsCheckout(false)} className="hover:text-brand-primary transition cursor-pointer"><ArrowLeft size={20} /></button> {t.titleCheckout}</>
                  ) : (
                    <><ShoppingBag size={20} className="text-brand-primary" /> {t.titleCart}</>
                  )}
                </h2>
                <button onClick={onClose} className="p-2 text-gray-500 bg-neutral-800 rounded-full hover:bg-neutral-700 hover:text-white transition cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            )}
            
            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8 text-center bg-black/20">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle size={56} className="text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">{t.successTitle}</h2>
                <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 w-full shadow-xl">
                    <p className="text-gray-400 text-sm mb-6">{t.successDesc}</p>
                    <span className="text-[10px] text-brand-primary uppercase font-black tracking-widest">Numéro de commande</span>
                    <p className="text-4xl font-display font-black text-white tracking-tighter mt-2">#PF-{orderId ? orderId.split('-')[0].toUpperCase() : '0000'}</p>
                </div>
                <button onClick={() => { onClose(); window.location.href = `/${lang}/track?order_id=${orderId}`; }} className="w-full bg-brand-primary text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/30 cursor-pointer hover:scale-[1.02] transition-transform">
                  Suivre ma commande
                </button>
              </div>
            ) : isPayment && clientSecret && orderId ? (
              <Elements options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#a855f7' } } }} stripe={stripePromise}>
                <StripeCheckoutForm total={finalPrice} orderId={orderId} onSuccess={() => { clearCart(); setIsPayment(false); setIsSuccess(true); }} onCancel={() => setIsPayment(false)} t={t} />
              </Elements>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  
                  {/* EMPTY STATE */}
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
                      <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2">
                        <Rocket size={48} className="text-brand-primary" />
                      </div>
                      <p className="text-white font-display font-black uppercase tracking-widest text-xl">{t.emptyCart}</p>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-[200px]">Préparez votre prochaine mission culinaire.</p>
                    </div>
                  ) : !isCheckout ? (
                      <div className="space-y-8">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                          <ShoppingBag size={14} className="text-brand-primary" /> 
                          {totalItems} {totalItems > 1 ? t.itemsPlural : t.items} dans le vaisseau
                        </div>
                        
                        {Object.entries(groupedItems).map(([restoId, group]) => (
                          <div key={restoId} className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 bg-neutral-800/50 p-2 rounded-lg inline-flex">
                              <Store size={12} className="text-brand-primary" /> {group.name}
                            </h3>
                            <div className="space-y-3">
                              {group.items.map(i => (
                                <div key={i.id} className="flex gap-4 items-center bg-black/30 p-3 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
                                  <div className="w-16 h-16 relative bg-neutral-800 rounded-xl overflow-hidden shrink-0 shadow-md">
                                    {i.image_url && <Image src={i.image_url} alt={i.name} fill className="object-cover" />}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-black text-[11px] uppercase tracking-wide leading-tight mb-1">{i.name}</h4>
                                    <div className="text-brand-primary font-bold text-xs">{(i.price * i.quantity).toFixed(2)} {siteConfig.currency}</div>
                                  </div>
                                  <div className="flex items-center gap-3 bg-neutral-900 rounded-full px-2 py-1.5 border border-white/10">
                                    <button onClick={() => updateQuantity(i.id, i.quantity - 1)} className="text-gray-400 hover:text-brand-primary transition cursor-pointer p-1"><Minus size={12} /></button>
                                    <span className="text-white text-[11px] font-black w-4 text-center">{i.quantity}</span>
                                    <button onClick={() => updateQuantity(i.id, i.quantity + 1)} className="text-gray-400 hover:text-brand-primary transition cursor-pointer p-1"><Plus size={12} /></button>
                                  </div>
                                  <button onClick={() => removeFromCart(i.id)} className="text-gray-600 hover:text-red-500 transition cursor-pointer p-2"><Trash2 size={16} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="mt-8 p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                          <label htmlFor="coupon" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Tag size={14}/> {t.couponLabel}</label>
                          <div className="flex gap-2">
                            <input id="coupon" type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={t.couponPlaceholder} className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold focus:border-brand-primary outline-none transition uppercase" />
                            <button onClick={handleApplyCoupon} disabled={isVerifyingCoupon || !couponCode} className="bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer">
                              {isVerifyingCoupon ? <Loader2 size={14} className="animate-spin" /> : t.couponBtn}
                            </button>
                          </div>
                          {couponError && <p className="text-red-500 text-[9px] mt-3 font-bold uppercase tracking-widest">{couponError}</p>}
                          {appliedCoupon && (
                            <div className="flex items-center justify-between mt-3 bg-green-500/10 border border-green-500/20 p-2 rounded-lg">
                              <p className="text-green-500 text-[10px] font-black uppercase tracking-widest ml-2">✓ {appliedCoupon.code} (-{appliedCoupon.discount_value}{appliedCoupon.discount_type === 'percentage' ? '%' : ` ${siteConfig.currency}`})</p>
                              <button onClick={() => setAppliedCoupon(null)} className="text-gray-500 hover:text-red-500 transition p-1 cursor-pointer"><X size={14}/></button>
                            </div>
                          )}
                        </div>
                        <button onClick={clearCart} className="text-[9px] text-gray-600 hover:text-red-500 font-black uppercase tracking-[0.3em] flex items-center gap-2 mx-auto transition cursor-pointer mt-4"><Trash2 size={12} /> {t.clearCart}</button>
                      </div>
                    ) : (
                      <form id="checkout-form" onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label htmlFor="customer_name" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t.name}</label>
                            <input id="customer_name" required placeholder={t.namePlaceholder} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black text-white border border-neutral-800 rounded-xl px-5 py-4 font-bold outline-none focus:border-brand-primary transition" />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="customer_phone" className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">{t.phone}</label>
                            <input id="customer_phone" required type="tel" placeholder={t.phonePlaceholder} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black text-white border border-neutral-800 rounded-xl px-5 py-4 font-mono outline-none focus:border-brand-primary transition" />
                        </div>
                        
                        <fieldset className="space-y-3 pt-2">
                          <legend className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3"><Calendar size={14} className="text-brand-primary" /> {t.date}</legend>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {days.map((d, idx) => (
                              <button key={idx} type="button" onClick={() => { setSelectedDate(d); setSelectedTime(""); }} className={`shrink-0 px-5 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition cursor-pointer ${selectedDate?.toDateString() === d.toDateString() ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.4)]" : "bg-neutral-900 border-neutral-800 text-gray-500 hover:border-gray-600"}`}>{d.toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</button>
                            ))}
                          </div>
                        </fieldset>

                        <fieldset className="space-y-3">
                          <legend className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3"><Clock size={14} className="text-brand-primary" /> {t.time}</legend>
                          <div className="grid grid-cols-4 gap-2">
                            {availableSlots.map(s => <button key={s} type="button" onClick={() => setSelectedTime(s)} className={`py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${selectedTime === s ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.4)]" : "bg-neutral-900 border-neutral-800 text-gray-500 hover:border-gray-600"}`}>{s}</button>)}
                          </div>
                        </fieldset>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <button type="button" onClick={() => setFormData({...formData, type: "Click & Collect"})} className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition cursor-pointer ${formData.type !== "Livraison" ? "bg-brand-primary border-brand-primary text-white shadow-lg" : "bg-black border-neutral-800 text-gray-500"}`}>{t.takeaway}</button>
                          <button type="button" onClick={() => setFormData({...formData, type: "Livraison"})} className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition cursor-pointer ${formData.type === "Livraison" ? "bg-brand-primary border-brand-primary text-white shadow-lg" : "bg-black border-neutral-800 text-gray-500"}`}>{t.delivery}</button>
                        </div>

                        <AnimatePresence>
                          {formData.type === "Livraison" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden pt-2">
                              {totalPrice < 25 && <div className="bg-red-900/10 text-red-500 text-[10px] font-black p-4 rounded-xl border border-red-500/20 text-center uppercase tracking-widest">⚠️ {t.minOrderError}</div>}
                              <div className="space-y-4 bg-black p-5 rounded-2xl border border-neutral-800">
                                <label htmlFor="delivery_address" className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> {t.address}</label>
                                <input id="delivery_address" required={formData.type === "Livraison"} placeholder={t.addressPlaceholder} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-primary transition" />
                                <div className="grid grid-cols-2 gap-3">
                                  <input id="zip_code" required={formData.type === "Livraison"} placeholder={t.zip} value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} maxLength={4} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-primary transition" />
                                  <input id="floor_number" placeholder={t.floorPlaceholder} value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-primary transition" />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-2 pt-2">
                          <label htmlFor="order_comments" className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={14} /> {t.comments}</label>
                          <textarea id="order_comments" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} className="w-full bg-black text-white font-bold border border-neutral-800 rounded-xl px-5 py-4 outline-none focus:border-brand-primary transition h-24 resize-none text-sm" placeholder={t.commentsPlaceholder} />
                        </div>
                      </form>
                    )
                  }
                </div>
                {items.length > 0 && (
                  <div className="p-6 md:p-8 border-t border-neutral-800 bg-neutral-900 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] z-20">
                    <div className="space-y-3 mb-6">
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span>{t.totalEstimated}</span>
                          <span className="line-through">{totalPrice.toFixed(2)} {siteConfig.currency}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-500">
                          <span>{t.discount} ({appliedCoupon.code})</span>
                          <span>-{discountAmount.toFixed(2)} {siteConfig.currency}</span>
                        </div>
                      )}
                      {profile && profile.wallet_balance > 0 && (
                        <div className="py-4 px-5 bg-black/40 border border-brand-primary/30 rounded-2xl my-4 transition hover:bg-black/60">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="accent-brand-primary w-5 h-5 cursor-pointer" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Utiliser cagnotte ({Number(profile.wallet_balance).toFixed(2)} {siteConfig.currency})</span>
                            </div>
                            {useWallet && <span className="text-brand-primary font-black text-xs">-{walletUsed.toFixed(2)} CHF</span>}
                          </label>
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-3 border-t border-white/5">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Total final</span>
                        <span className="text-3xl font-display font-black text-white leading-none">{finalPrice.toFixed(2)} <span className="text-[10px] tracking-normal text-brand-primary ml-1">{siteConfig.currency}</span></span>
                      </div>
                      
                      {user && finalPrice > 0 && (
                        <p className="text-right text-[9px] text-green-500 font-black uppercase tracking-widest mt-1">
                          + {earnedCashback.toFixed(2)} CHF {t.cashbackNotice}
                        </p>
                      )}
                    </div>
                    
                    {/* ✅ NOUVEAU: Affichage de l'erreur juste au-dessus du bouton */}
                    {checkoutError && (
                      <div className="bg-red-900/20 border border-red-500/30 text-red-500 text-[10px] font-bold p-4 rounded-xl mb-4 text-center uppercase tracking-widest leading-relaxed">
                        ⚠️ {checkoutError}
                      </div>
                    )}

                    {!isCheckout ? (
                      <button onClick={() => setIsCheckout(true)} className="w-full bg-brand-primary text-white font-black py-5 rounded-[1.5rem] uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] cursor-pointer">
                        {t.btnValidate} <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button type="submit" form="checkout-form" disabled={!isFormReady || isSubmitting} className={`w-full font-black py-5 rounded-[1.5rem] uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 transition-all cursor-pointer ${isFormReady && !isSubmitting ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98]" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}`}>
                        {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> {t.sending}</> : <><ShieldCheck size={18} /> Continuer vers le paiement</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}