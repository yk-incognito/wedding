import "./globals.css";

export const metadata = {
  title: "Vows & Celebrations - Interactive Wedding Invitation Builder",
  description: "Create and customize your luxury digital wedding invitation microsite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
