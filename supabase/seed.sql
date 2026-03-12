-- Bloc d'exécution pour injecter des données liées dynamiquement
DO $$
DECLARE
  v_resto_id UUID;
  v_cat_entree_id UUID;
  v_cat_plat_id UUID;
BEGIN
  -- 1. Récupération de l'ID de ton restaurant
  SELECT id INTO v_resto_id FROM restaurants WHERE slug = 'ma-super-cuisine';

  -- Sécurité : on arrête si le restaurant n'existe pas
  IF v_resto_id IS NULL THEN
    RAISE NOTICE 'Restaurant ma-super-cuisine introuvable. Avez-vous exécuté le script précédent ?';
    RETURN;
  END IF;

  -- 2. Création de deux catégories
  INSERT INTO categories (restaurant_id, name_fr, "order") 
  VALUES (v_resto_id, 'Entrées à partager', 1) 
  RETURNING id INTO v_cat_entree_id;

  INSERT INTO categories (restaurant_id, name_fr, "order") 
  VALUES (v_resto_id, 'Plats Signatures', 2) 
  RETURNING id INTO v_cat_plat_id;

  -- 3. Création de quelques produits
  INSERT INTO products (restaurant_id, category_id, name_fr, description_fr, price, is_available) 
  VALUES 
  (v_resto_id, v_cat_entree_id, 'Nems croustillants', '4 pièces au poulet et légumes croquants, sauce nuoc-mâm.', 7.50, true),
  (v_resto_id, v_cat_entree_id, 'Salade Edamame', 'Fèves de soja à la fleur de sel.', 4.50, true),
  
  (v_resto_id, v_cat_plat_id, 'Le Tigre qui Pleure', 'Bœuf mariné et snacké, riz parfumé, sauce tamarin épicée.', 21.00, true),
  (v_resto_id, v_cat_plat_id, 'Poke Bowl Saumon', 'Saumon frais, mangue, avocat, riz vinaigré et graines de sésame.', 16.50, true);

END $$;