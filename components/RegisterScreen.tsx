import React, { useState } from 'react';
import { signUp } from '../src/services/authService';
import { LoadingSpinner } from './icons';
import type { UserRole } from '../types';

interface RegisterScreenProps {
    onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('voluntario');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        const passwordError = ((pw) => {
            if (pw.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
            if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'A senha deve conter letras e números.';
            return null;
        })(password);

        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            await signUp(name, email, password, role);
            setSuccessMessage('Cadastro realizado com sucesso! Verifique seu e-mail e aguarde a aprovação de um administrador.');
            // Don't clear form immediately so user can see success
            setTimeout(() => {
                onBackToLogin();
            }, 5000);
        } catch (err: any) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('Este e-mail já está em uso.');
                    break;
                case 'auth/invalid-email':
                    setError('O formato do e-mail é inválido.');
                    break;
                case 'auth/weak-password':
                    setError('A senha é muito fraca. Use uma combinação de letras e números.');
                    break;
                default:
                    setError('Ocorreu um erro ao criar a conta.');
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    if (successMessage) {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
                 <div className="w-full max-w-md text-center">
                     <h1 className="text-2xl font-bold text-white">Cadastro Enviado!</h1>
                     <p className="text-green-400 mt-4">{successMessage}</p>
                     <button onClick={onBackToLogin} className="mt-6 font-semibold text-cyan-400 hover:underline">Voltar para o Login</button>
                 </div>
             </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center">Criar Conta</h1>
                <p className="text-gray-400 text-center mb-6">Junte-se ao sistema NUPDEC.</p>

                <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-lg shadow-lg">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nome Completo"
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
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
                            placeholder="Senha (mín. 8 caracteres, com letras e números)"
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar Senha"
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="voluntario">Voluntário</option>
                            <option value="operador">Operador</option>
                            <option value="telefonista">Telefonista</option>
                            <option value="administrador">Administrador</option>
                        </select>
                        
                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-md disabled:bg-cyan-800 flex items-center justify-center">
                            {loading ? <LoadingSpinner className="w-5 h-5"/> : 'Cadastrar'}
                        </button>
                    </form>
                </div>
                 <div className="text-center mt-6 text-sm">
                    <span className="text-gray-400">Já tem uma conta? </span>
                    <button onClick={onBackToLogin} className="font-semibold text-cyan-400 hover:underline">Faça o login</button>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;