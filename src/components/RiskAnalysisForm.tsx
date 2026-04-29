/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, FileDown, Plus, Trash2, AlertCircle } from 'lucide-react';
import { exportRiskAnalysisToPDF, RiskAnalysis } from '../lib/riskPDF';

export const RiskAnalysisForm = () => {
  const [formData, setFormData] = useState<RiskAnalysis>({
    serviceDescription: '',
    location: '',
    startDate: '',
    emergencyNumbers: '',
    steps: [{ action: '', risks: '', controls: '' }],
    preparedBy: '',
    preparedDate: new Date().toLocaleDateString('pt-BR'),
    revisedBy: '',
    revisedDate: ''
  });

  const addStep = () => {
    if (formData.steps.length < 5) {
      setFormData({
        ...formData,
        steps: [...formData.steps, { action: '', risks: '', controls: '' }]
      });
    }
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index: number, field: keyof RiskAnalysis['steps'][0], value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2.5 rounded-xl">
            <ClipboardCheck className="text-orange-600 w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Análise de Risco (DC-85)</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">Serviços Críticos / Alto Risco</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => exportRiskAnalysisToPDF(formData)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand transition-all shadow-md active:scale-95 border-b-4 border-black/10"
          >
            <FileDown className="w-4 h-4" />
            GERAR PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição do Serviço</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Pintura da fachada superior"
            value={formData.serviceDescription}
            onChange={e => setFormData({ ...formData, serviceDescription: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Local do Serviço</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Área externa / Telhado"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Início</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="DD/MM/AAAA"
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Números de Emergência</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="192, 193, Líder local..."
            value={formData.emergencyNumbers}
            onChange={e => setFormData({ ...formData, emergencyNumbers: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Etapas e Riscos</h3>
          {formData.steps.length < 5 && (
            <button onClick={addStep} className="text-brand hover:bg-brand-light font-bold text-xs flex items-center gap-1 px-2 py-1 rounded">
              <Plus className="w-3 h-3" /> ADICIONAR ETAPA
            </button>
          )}
        </div>
        <div className="p-6 space-y-6">
          {formData.steps.map((step, idx) => (
            <div key={idx} className="relative grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Etapa {idx + 1}</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs min-h-[60px]"
                  placeholder="Ação a ser feita"
                  value={step.action}
                  onChange={e => updateStep(idx, 'action', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Riscos</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs min-h-[60px]"
                  placeholder="O que pode acontecer?"
                  value={step.risks}
                  onChange={e => updateStep(idx, 'risks', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Medidas de Controle</label>
                  {idx > 0 && (
                    <button onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs min-h-[60px]"
                  placeholder="Como evitar o risco?"
                  value={step.controls}
                  onChange={e => updateStep(idx, 'controls', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Preparado Por</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            value={formData.preparedBy}
            onChange={e => setFormData({ ...formData, preparedBy: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Revisado Por</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            value={formData.revisedBy}
            onChange={e => setFormData({ ...formData, revisedBy: e.target.value })}
          />
        </div>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-orange-600 w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-orange-800 text-xs leading-relaxed">
          <strong>Atenção:</strong> Este documento é para pronta consulta. As informações digitadas aqui permanecem apenas enquanto a página estiver aberta, a menos que você gere o PDF para salvar externamente. Use este formulário para documentar serviços críticos como trabalho em altura ou eletricidade.
        </p>
      </div>
    </div>
  );
};
