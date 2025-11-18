import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected import path to point to the App component within the 'src' directory.
import App from './src/App';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// FIX: Corrected import path to point to the firebaseConfig file within the 'src' directory.
import { auth } from './src/firebaseConfig';
// FIX: Corrected import path to point to the authService file within the 'src' directory.
import { getUserProfile, logOut } from './src/services/authService';
// FIX: Corrected import path to point to the types file within the 'src' directory.
import type { User } from './src/types';
// FIX: Corrected import path to point to the icons component within the 'src' directory.
import { LoadingSpinner } from './src/components/icons';

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
              // You could show a "please verify your email" message here.
            }
            
            if (userProfile.status === 'pending') {
                alert('Sua conta ainda está pendente de aprovação por um administrador.');
                setUser(null);
                // Ensure user is logged out if pending
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
           // Fallback for when there is no firestore profile, create a temporary citizen
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
