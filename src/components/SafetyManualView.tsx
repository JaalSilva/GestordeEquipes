/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { BookOpen, ShieldCheck, AlertTriangle, HardHat, Info } from 'lucide-react';
import { SAFETY_MANUAL } from '../constants/safetyManual';

export const SafetyManualView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{SAFETY_MANUAL.title}</h2>
          <p className="text-slate-500 text-sm mt-1">Normas de Saúde e Segurança - Edição {SAFETY_MANUAL.date}</p>
        </div>
        <div className="bg-brand-light p-3 rounded-full">
          <BookOpen className="text-brand w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-8">
          {SAFETY_MANUAL.sections.map((section) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {section.id === 'intro' ? <Info className="w-5 h-5 text-brand" /> : 
                   section.id === 'cap1' ? <ShieldCheck className="w-5 h-5 text-green-600" /> : 
                   <AlertTriangle className="w-5 h-5 text-orange-600" />}
                  {section.title}
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {section.content && (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                )}

                {section.subsections && section.subsections.map((sub, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-bold text-slate-800 border-l-4 border-brand pl-3">
                      {sub.title}
                    </h4>
                    <p className="text-slate-600 pl-4 whitespace-pre-line">
                      {sub.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <HardHat className="w-5 h-5" />
              Lembrete Vital
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              "Jehovah Deus, o 'Grandioso Criador', considera a vida sagrada. Para ele, todos os humanos são preciosos e merecem proteção."
            </p>
            <div className="mt-4 pt-4 border-t border-white/20 text-xs italic">
              — Introdução, Parágrafo 2
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Acesso Rápido</h3>
            <nav className="space-y-2">
              {SAFETY_MANUAL.sections.map(s => (
                <button 
                  key={s.id}
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                >
                  {s.title.split(':')[0]}
                  <BookOpen className="w-4 h-4 opacity-30" />
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
