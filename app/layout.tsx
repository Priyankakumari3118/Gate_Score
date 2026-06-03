import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Score App',
  description: 'Teacher dashboard for student records and scored prediction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
