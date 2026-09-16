export const metadata = {
  title: "Seminar Web Game",
  description: "เกมทายราคาสินค้าสำหรับงานสัมมนา",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
