import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server"; 

interface CartItem {
  id: string; 
  quantity: number;
  name?: string;
  price?: number;
}

const VALID_ORDER_TYPES = ["Livraison", "Click & Collect"] as const; 
type OrderType = typeof VALID_ORDER_TYPES[number];

interface RequestBody {
  amount: number; 
  items: CartItem[];
  couponCode?: string;
  useWallet?: boolean;
  customerName: string; 
  customerPhone: string; 
  pickupDate: string;
  pickupTime: string;
  orderType: OrderType;
  deliveryAddress?: string;
  deliveryZip?: string | number;
  comments?: string;
  databaseOrderId: string; 
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;

    const { 
        couponCode, useWallet, items, 
        pickupDate, pickupTime, orderType, deliveryAddress, deliveryZip, comments,
        databaseOrderId 
    } = body;

    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // --- 🛡️ SÉCURITÉ #1 : VALIDATION DU TYPE DE COMMANDE ---
    if (!VALID_ORDER_TYPES.includes(orderType)) {
      return NextResponse.json({ error: "Type de commande invalide." }, { status: 400 });
    }

    // --- 🛡️ SÉCURITÉ #2 : VALIDATION NPA (GENÈVE) ---
    if (orderType === "Livraison") {
      const zipStr = typeof deliveryZip === 'string' ? deliveryZip.trim() : 
                     typeof deliveryZip === 'number' ? String(deliveryZip) : '';

      if (!/^12\d{2}$/.test(zipStr)) {
        return NextResponse.json(
          { error: "La livraison est restreinte au canton de Genève (NPA 12xx)." }, 
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }

    if (!databaseOrderId) {
      return NextResponse.json({ error: "Numéro de commande manquant." }, { status: 400 });
    }

    // --- 🛡️ SÉCURITÉ #3 : RECALCUL DU MONTANT CÔTÉ SERVEUR ---
    // ✅ CORRECTION : Extraction des 36 premiers caractères pour éviter que la DB ne rejette les produits personnalisés
    const productBaseIds = items.map((i) => String(i.id).substring(0, 36));
    
    const { data: dbProducts, error: dbError } = await supabaseAdmin
      .from("products")
      .select("id, price, is_available")
      .in("id", productBaseIds);

    if (dbError || !dbProducts) {
      console.error("Erreur vérification prix:", dbError);
      throw new Error("Impossible de vérifier les prix en base de données.");
    }

    let serverBaseAmount = 0;
    for (const clientItem of items) {
      // ✅ CORRECTION : On cherche la correspondance avec le base ID
      const baseId = String(clientItem.id).substring(0, 36);
      const dbProduct = dbProducts.find(d => d.id === baseId);
      
      if (!dbProduct || !dbProduct.is_available) {
        return NextResponse.json({ error: `L'article ${clientItem.name || 'sélectionné'} n'est plus disponible.` }, { status: 400 });
      }

      // ✅ CORRECTION : Pour les produits personnalisés, on doit faire confiance au prix envoyé par le front
      // car le prix en base (dbProduct.price) ne contient pas les suppléments payants.
      const isCustomized = String(clientItem.id).length > 36;
      const finalItemPrice = isCustomized ? (clientItem.price || dbProduct.price) : dbProduct.price;

      serverBaseAmount += (finalItemPrice * (clientItem.quantity || 1));
    }

    let finalAmount = serverBaseAmount;
    let discountApplied = 0;

    // --- Logique Coupon ---
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < now;

        if (!isExpired && serverBaseAmount >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === "percentage") {
            discountApplied = (serverBaseAmount * coupon.discount_value) / 100;
          } else {
            discountApplied = coupon.discount_value;
          }
          finalAmount = Math.max(0, serverBaseAmount - discountApplied);
        }
      }
    }

    // --- Logique Wallet ---
    let walletUsed = 0;
    if (useWallet && user) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile && profile.wallet_balance > 0) {
        const maxWalletAllowed = Math.max(0, finalAmount - 0.50);
        walletUsed = Math.min(maxWalletAllowed, Number(profile.wallet_balance));
        finalAmount = finalAmount - walletUsed;
      }
    }

    const amountInCents = Math.round(finalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json({ error: "Montant trop faible (Min 0.50 CHF)." }, { status: 400 });
    }

    // --- 🔗 LIEN AVEC LA COMMANDE EXISTANTE ---
    const finalComments = walletUsed > 0 
      ? `[Cagnotte utilisée: -${walletUsed.toFixed(2)} CHF]\n${comments || ""}` 
      : comments;

    await supabaseAdmin
      .from('orders')
      .update({ 
        total_amount: finalAmount, 
        special_instructions: `${orderType} | Date: ${pickupDate} ${pickupTime} | Addresse: ${deliveryAddress || 'N/A'} ${deliveryZip || ''} | Commentaire: ${finalComments}`
      })
      .eq('id', databaseOrderId);

    // --- 💳 CRÉATION INTENTION STRIPE ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: databaseOrderId,
        userId: user?.id || "guest",
        couponUsed: couponCode || "none",
        discountAmount: discountApplied.toFixed(2),
        walletUsed: walletUsed.toFixed(2),
        originalAmount: serverBaseAmount.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: databaseOrderId
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("❌ Erreur API Stripe/Supabase:", errorMessage);
    return NextResponse.json({ error: "Erreur serveur lors de la préparation du paiement." }, { status: 500 });
  }
}