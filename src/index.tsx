import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { auth } from './firebaseConfig';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getUserProfile, logOut } from './services/authService';
import type { User } from './types';
import { LoadingSpinner } from './components/icons';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

type AppUser = User & { activeOcorrenciaId?: string };

const AuthWrapper: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile) {
            if (!firebaseUser.emailVerified && userProfile.role !== 'administrador') {
              console.warn("User email not verified.");
            }
            
            if (userProfile.status === 'pending') {
                alert('Sua conta ainda está pendente de aprovação por um administrador.');
                setUser(null);
                if (auth.currentUser) {
                  await logOut();
                }
            } else if (userProfile.status === 'blocked') {
                alert('Sua conta foi bloqueada. Entre em contato com o administrador.');
                setUser(null);
                if (auth.currentUser) {
                  await logOut();
                }
            } else {
                 setUser({ ...userProfile, id: firebaseUser.uid });
            }
        } else {
           setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Cidadão',
            role: 'cidadao',
            status: 'active',
            isOnline: true,
            registrationDate: new Date().toISOString(),
            sessions: []
          });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <LoadingSpinner className="h-12 w-12" />
        <span className="ml-4 text-lg">Autenticando...</span>
      </div>
    );
  }

  return <App user={user} setAppUser={setUser} authLoading={authLoading} />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthWrapper />
  </React.StrictMode>
);