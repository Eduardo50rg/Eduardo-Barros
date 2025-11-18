import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, XMarkIcon, LoadingSpinner } from './icons';

// A simple markdown-to-html renderer to format the AI's response
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italic
        .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded">$1</code>') // Code
        .replace(/(\n|^)- (.*)/g, '$1<li class="ml-4">$2</li>') // List items
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside">$1</ul>') // Wrap lists in <ul>
        .replace(/\n/g, '<br />');

    return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: html }} />;
};

const GeminiQuickGuide: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const quickActions = [
        { label: 'Primeiros Socorros: Ferimentos', prompt: 'Me dê um guia rápido de primeiros socorros para ferimentos e cortes em uma situação de desastre.' },
        { label: 'Avaliação de Risco Estrutural', prompt: 'Como fazer uma avaliação de risco estrutural rápida e segura em um prédio danificado por enchente?' },
        { label: 'Procedimento de Evacuação', prompt: 'Quais os passos para um procedimento de evacuação seguro em área de alagamento com correnteza?' },
        { label: 'Hipotermia: Sinais e Ações', prompt: 'Quais os sinais de hipotermia em vítimas de alagamento e como agir imediatamente?' },
    ];
    
    const handleQuery = async (prompt: string) => {
        setIsLoading(true);
        setResponse('');
        setError('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                  systemInstruction: "Você é um assistente de IA para voluntários de defesa civil em missões de resgate. Forneça respostas claras, concisas e diretas em português do Brasil, focadas em procedimentos de segurança e emergência. Use listas (com hífens) e tópicos para facilitar a leitura. Priorize a segurança da vítima e do voluntário. Responda em markdown simples.",
                }
            });
            
            setResponse(result.text);

        } catch (err) {
            console.error(err);
            setError('Não foi possível obter uma resposta da IA. Verifique a conexão ou tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            handleQuery(query);
            setQuery('');
        }
    };
    
    const handleClear = () => {
        setQuery('');
        setResponse('');
        setError('');
    };

    return (
        <div className="flex flex-col h-full text-white">
            <div className="flex-grow p-4 overflow-y-auto">
                {!response && !isLoading && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <SparklesIcon className="h-12 w-12 text-purple-400 mb-4" />
                        <h3 className="font-bold text-lg">Guia Rápido IA</h3>
                        <p className="text-sm text-gray-400">Selecione uma ação rápida ou faça uma pergunta.</p>
                         <div className="grid grid-cols-2 gap-2 mt-6 w-full">
                            {quickActions.map(action => (
                                <button key={action.label} onClick={() => handleQuery(action.prompt)} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-left transition-colors">
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner className="h-8 w-8 text-purple-400" />
                    </div>
                )}
                {error && (
                    <div className="text-center p-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
                {response && (
                     <div className="text-sm">
                        <SimpleMarkdown text={response} />
                        <button onClick={handleClear} className="mt-4 text-sm text-cyan-400 hover:underline">Fazer outra pergunta</button>
                     </div>
                )}
            </div>
             <div className="p-3 border-t border-gray-700 flex-shrink-0 bg-gray-900/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Pergunte algo à IA..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:ring-purple-500 focus:border-purple-500"
                        disabled={isLoading}
                    />
                     <button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full px-4 disabled:bg-purple-800 disabled:cursor-not-allowed">Enviar</button>
                </form>
            </div>
        </div>
    );
};

export default GeminiQuickGuide;
