import React, { useState, useRef, useEffect } from 'react';
import type { Ocorrencia, User, ChatMessage } from '../types';
import { XMarkIcon, MicrophoneIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, StopIcon, PaperAirplaneIcon, TrashIcon } from './icons';

interface ChatPanelProps {
    ocorrencia: Ocorrencia;
    user: User;
    messages: ChatMessage[];
    onSendMessage: (message: string, type: 'text' | 'audio') => void;
    onClose?: () => void;
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ ocorrencia, user, messages, onSendMessage, onClose }) => {
    const [newMessage, setNewMessage] = useState('');
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded'>('idle');
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim(), 'text');
            setNewMessage('');
        }
    };

    const handleStartRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioBlob(audioBlob);
                    setAudioURL(audioUrl);
                    setRecordingStatus('recorded');
                    // Stop media stream tracks to turn off microphone light
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setRecordingStatus('recording');
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
            }
        } else {
            alert("Gravação de áudio não é suportada neste navegador.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleCancelRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
        }
        setRecordingStatus('idle');
        setAudioURL(null);
        setAudioBlob(null);
        audioChunksRef.current = [];
    };
    
    const handleSendAudio = async () => {
        if (audioBlob) {
            const base64Audio = await blobToBase64(audioBlob);
            onSendMessage(base64Audio, 'audio');
            handleCancelRecording(); // Reset state after sending
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col h-full text-white">
            <div className="flex-shrink-0 p-3 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Chat: {ocorrencia.tipo}</h3>
                    <p className="text-xs text-gray-400 font-mono">{ocorrencia.code}</p>
                </div>
                {onClose && (
                    // FIX: Wrap onClose in a lambda to prevent passing an event object to a function that expects none.
                    <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => {
                    const isSender = msg.senderId === user.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                            {!isSender && (
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-xs flex-shrink-0" title={msg.senderName}>
                                    {msg.senderName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSender ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                {!isSender && <p className="text-xs font-bold text-cyan-300 mb-1">{msg.senderName}</p>}
                                {msg.type === 'text' ? (
                                    <p className="text-sm break-words">{msg.message}</p>
                                ) : (
                                    <audio controls src={msg.message} className="w-full"></audio>
                                )}
                                <div className="text-right text-xs text-gray-300/70 mt-1 flex items-center justify-end gap-1">
                                    <span>{formatTime(msg.timestamp)}</span>
                                    {isSender && (
                                        msg.status === 'sending' ? <ClockIcon className="h-3 w-3" /> :
                                        msg.status === 'failed' ? <ExclamationTriangleIcon className="h-3 w-3 text-red-400" /> :
                                        <CheckCircleIcon className="h-3 w-3" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-900/50">
                {recordingStatus === 'idle' && (
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-sm text-white"
                        />
                        <button type="submit" className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white"><PaperAirplaneIcon className="h-5 w-5" /></button>
                        <button type="button" onClick={handleStartRecording} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"><MicrophoneIcon className="h-5 w-5" /></button>
                    </form>
                )}
                {recordingStatus === 'recording' && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-red-400 animate-pulse flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>Gravando...</span>
                        <button onClick={handleStopRecording} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"><StopIcon className="h-5 w-5" /></button>
                    </div>
                )}
                 {recordingStatus === 'recorded' && audioURL && (
                    <div className="flex items-center gap-2">
                        <audio src={audioURL} controls className="flex-grow"></audio>
                        <button onClick={handleCancelRecording} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"><TrashIcon className="h-5 w-5" /></button>
                        <button onClick={handleSendAudio} className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white"><PaperAirplaneIcon className="h-5 w-5" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};