import React, { useState } from 'react';
import { signIn, passwordReset } from '../src/services/authService';
import { LoadingSpinner } from './icons';
import RegisterScreen from './RegisterScreen'; // New component

const NewNupdecLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="loginHandsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#fb923c' }} /> {/* orange-400 */}
                <stop offset="100%" style={{ stopColor: '#f97316' }} /> {/* orange-500 */}
            </linearGradient>
            <filter id="loginLogoShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
            </filter>
        </defs>
        <g filter="url(#loginLogoShadow)">
            {/* Hands */}
            <path d="M20 90 C 25 70, 35 60, 50 60 C 65 60, 75 70, 80 90 L 70 95 C 65 80, 60 75, 50 75 C 40 75, 35 80, 30 95 Z" fill="url(#loginHandsGrad)" />
            {/* Heart */}
            <path d="M50 25 C 40 15, 25 25, 25 40 C 25 55, 50 75, 50 75 S 75 55, 75 40 C 75 25, 60 15, 50 25 Z" fill="white" fillOpacity="0.95" />
        </g>
    </svg>
);

const PasswordResetModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await passwordReset(email);
            setMessage('Link de redefinição de senha enviado para o seu e-mail!');
        } catch (err: any) {
            setError(err.message || 'Falha ao enviar e-mail.');
        } finally {
            setLoading(false);
        }
    };
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg p-8 w-full max-w-sm text-gray-800" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
                {message && <p className="text-green-600 mb-4">{message}</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}
                <form onSubmit={handleReset} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail de cadastro" required className="w-full p-2 border rounded"/>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300">
                            {loading ? <LoadingSpinner className="w-5 h-5"/> : 'Enviar Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const LoginScreen: React.FC = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            // onAuthStateChanged in App.tsx will handle the redirect
        } catch (err: any) {
             switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('E-mail ou senha incorretos.');
                    break;
                case 'auth/invalid-email':
                    setError('Formato de e-mail inválido.');
                    break;
                default:
                    setError('Ocorreu um erro ao fazer login.');
                    break;
            }
            setLoading(false);
        }
    };

    if (view === 'register') {
        return <RegisterScreen onBackToLogin={() => setView('login')} />;
    }

    return (
        <>
            {showPasswordReset && <PasswordResetModal onClose={() => setShowPasswordReset(false)} />}
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://www.defesacivil.rs.gov.br/upload/recortes/202405/10153308_1215469_GDO.jpeg')"}}></div>
                <div className="relative z-10 w-full max-w-sm">
                    <NewNupdecLogo className="w-32 h-32 mb-4 mx-auto" />
                    <h1 className="text-3xl font-bold text-white">Acesso Restrito</h1>
                    <p className="text-gray-400 mb-6">NUPDEC - Sistema de Comando</p>
                    
                    <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-lg shadow-lg">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="E-mail"
                                required
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Senha"
                                required
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-md disabled:bg-cyan-800 flex items-center justify-center">
                                {loading ? <LoadingSpinner className="w-5 h-5"/> : 'Entrar'}
                            </button>
                        </form>
                        <div className="text-center mt-4 text-sm">
                            <button onClick={() => setShowPasswordReset(true)} className="text-cyan-400 hover:underline">Esqueci minha senha</button>
                        </div>
                    </div>
                     <div className="text-center mt-6 text-sm">
                        <span className="text-gray-400">Não tem uma conta? </span>
                        <button onClick={() => setView('register')} className="font-semibold text-cyan-400 hover:underline">Cadastre-se</button>
                    </div>
                </div>
            </div>
        </>
    );
};