import "./globals.css";

export const metadata = {
  title: "Vows & Celebrations - Interactive Wedding Invitation Builder",
  description: "Create and customize your luxury digital wedding invitation microsite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-[#14070a] text-[#faf5ed]">
        {children}
      </body>
    </html>
  );
}
