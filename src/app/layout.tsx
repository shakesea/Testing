import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'Auth System',
  description: 'Login and Register System',
};

export default function RootLayout({ children }: { children:ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4">
        {children}
        <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        toastStyle={{
          borderRadius: '8px',
          fontFamily: 'inherit',
          fontSize: '14px',
        }}
        />
      </body>
    </html>
  )
}