// app/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // On ne met PAS de balises <html> ou <body> ici 
  // car elles sont déjà gérées dans app/[lang]/layout.tsx
  return children;
}