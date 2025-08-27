'use client';

import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import MainApp from '@/components/MainApp';

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}