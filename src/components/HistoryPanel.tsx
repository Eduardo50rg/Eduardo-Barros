import React, { useState } from 'react';
import type { HistoryPanelProps } from '../types';
import { ClockIcon, XMarkIcon } from './icons';

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, onApply, onClear, ocorrencias, voluntarios }) => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const toLocalISOString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [start, setStart] = useState(toLocalISOString(yesterday));
  const [end, setEnd] = useState(toLocalISOString(now));
  const [reportError, setReportError] = useState('');

  const handleApply = () => {
    setReportError('');
    onApply(new Date(start).toISOString(), new Date(end).toISOString());
  };
  
  const generateReport = () => {
    setReportError('');
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        setReportError('Por favor, habilite pop-ups para gerar o relatório.');
        return;
    }

    const ocorrenciasNoPeriodo = ocorrencias.filter(o => o.timestamp && o.timestamp >= start && o.timestamp <= end);
    const voluntariosAtivos = voluntarios.filter(v => v.creationDate <= end);
    
    const ocorrenciaStats = ocorrenciasNoPeriodo.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);


    const reportHTML = `
        <html>
            <head>
                <title>Relatório Operacional</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 font-sans p-8">
                <div class="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                    <h1 class="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">Relatório Operacional</h1>
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-gray-700">Período Analisado</h2>
                        <p class="text-gray-600">De: ${new Date(start).toLocaleString('pt-BR')}</p>
                        <p class="text-gray-600">Até: ${new Date(end).toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 class="text-xl font-semibold text-gray-700 mb-4">Resumo das Ocorrências</h2>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p><strong>Total de Ocorrências:</strong> ${ocorrenciasNoPeriodo.length}</p>
                                <p><strong>Abertas:</strong> ${ocorrenciaStats['Aberta'] || 0}</p>
                                <p><strong>Em Atendimento:</strong> ${ocorrenciaStats['Em Atendimento'] || 0}</p>
                                <p><strong>Fechadas:</strong> ${ocorrenciaStats['Fechada'] || 0}</p>
                            </div>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-700 mb-4">Resumo dos Voluntários</h2>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p><strong>Total de Voluntários Registrados no Período:</strong> ${voluntariosAtivos.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[4000] flex justify-center items-center p-4" onClick={() => onClose()}>
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col text-white animate-fade-in-up border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 mr-3 text-cyan-400" />
            <h2 className="text-xl font-bold">Histórico e Relatórios</h2>
          </div>
          <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-gray-700" aria-label="Fechar">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400">Selecione um intervalo para visualizar os dados no mapa ou gerar um relatório.</p>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">Início</label>
            <input
              type="datetime-local"
              id="start-date"
              value={start}
              onChange={(e) => { setStart(e.target.value); setReportError(''); }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">Fim</label>
            <input
              type="datetime-local"
              id="end-date"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setReportError(''); }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>

        {reportError && (
            <div className="px-6 pb-4">
                <p className="text-yellow-400 text-sm bg-yellow-900/50 p-3 rounded-md">{reportError}</p>
            </div>
        )}

        <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-lg space-y-2">
            <button
                onClick={() => generateReport()}
                className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md"
            >
                Gerar Relatório
            </button>
            <div className="flex justify-between">
                <button
                    onClick={() => onClear()}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-md"
                >
                    Ver Dados ao Vivo
                </button>
                <button
                    onClick={() => handleApply()}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md"
                >
                    Aplicar Filtro no Mapa
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;