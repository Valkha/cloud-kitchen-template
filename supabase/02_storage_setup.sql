-- 1. Création du dossier (Bucket) public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Autoriser tout le monde à VOIR les images
CREATE POLICY "Lecture publique des images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'restaurant-assets');

-- 3. Autoriser l'upload (On sécurisera ça pour l'admin plus tard)
CREATE POLICY "Upload d'images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'restaurant-assets');