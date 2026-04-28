/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, FileDown, Plus, Trash2, AlertCircle, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { exportRiskAnalysisToPDF, RiskAnalysis } from '../lib/riskPDF';
import { GoogleGenAI, Type } from "@google/genai";

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

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // --- IA & WEBHOOK IMPLEMENTATION ---

  /**
   * Captura dados do formulário e usa Gemini para gerar uma análise técnica detalhada em JSON.
   */
  const gerarAnalise = async (): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Analise tecnicamente este formulário de segurança:
    Serviço: ${formData.serviceDescription}
    Local: ${formData.location}
    Etapas: ${JSON.stringify(formData.steps)}
    
    Retorne um JSON com:
    - critical_risk_level: "baixo", "médio" ou "alto"
    - ai_expert_recommendation: string com recomendação técnica
    - missing_controls: lista de controles que foram esquecidos
    - compliance_score: 0-100`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critical_risk_level: { type: Type.STRING },
            ai_expert_recommendation: { type: Type.STRING },
            missing_controls: { type: Type.ARRAY, items: { type: Type.STRING } },
            compliance_score: { type: Type.NUMBER }
          },
          required: ["critical_risk_level", "ai_expert_recommendation", "compliance_score"]
        }
      }
    });

    return response.text || "{}";
  };

  /**
   * Envia o relatório completo (Formulário + Análise IA) para o webhook externo.
   */
  const enviarRelatorio = async () => {
    if (!formData.serviceDescription) {
      alert("Por favor, preencha ao menos a descrição do serviço.");
      return;
    }

    setIsAnalyzing(true);
    setWebhookStatus('loading');

    try {
      // 1. Obtém a string JSON da IA
      const resIA = await gerarAnalise();
      
      // 2. Converte para JSON válido e mescla com os dados do formulário
      const analiseIA = JSON.parse(resIA);
      const payloadCompleto = {
        timestamp: new Date().toISOString(),
        formulario: formData,
        analise_ia: analiseIA,
        metadata: {
          system: "Manutenção Salão v3.0",
          platform: "AI Studio Build"
        }
      };

      // 3. Envia automaticamente via HTTP POST para o webhook
      const response = await fetch("https://SEU_WEBHOOK_AQUI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadCompleto)
      });

      if (!response.ok) throw new Error("Erro na comunicação com o Webhook");

      setWebhookStatus('success');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      setWebhookStatus('error');
      alert("Erro ao processar análise ou enviar para o dashboard externo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- END IA & WEBHOOK ---

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
            onClick={enviarRelatorio}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 ${
              webhookStatus === 'success' 
                ? 'bg-emerald-500 text-white' 
                : webhookStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ANALISANDO...
              </>
            ) : webhookStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                ENVIADO!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                IA & DASHBOARD
              </>
            )}
          </button>

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
