import { AuthProvider } from '@/context/AuthContext'; // 💡 'authContext' থেকে পরিবর্তন করে 'AuthContext' করা হয়েছে
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}