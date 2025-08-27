import ClientProvider from "./client-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Cycling Toto - Predict the Winners</title>
        <meta
          name="description"
          content="Predict winners of Tour de France, Vuelta, and Giro d'Italia"
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}