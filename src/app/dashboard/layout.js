import React from 'react';
import Sidebar from './_components/Sidebar';



export default function PageLayout({children}) {
  return (
    <div className="flex h-screen overflow-hidden">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
  );
}