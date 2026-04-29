/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  ShieldCheck, 
  Info, 
  ChevronRight,
  ExternalLink,
  Github,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'motion/react';

interface ProfileViewProps {
  themeColor: string;
  onThemeChange: (color: string) => void;
}

const THEME_COLORS = [
  { name: 'Azul Real', color: '#2563eb' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Esmeralda', color: '#059669' },
  { name: 'Âmbar', color: '#d97706' },
  { name: 'Carmesim', color: '#dc2626' },
  { name: 'Slate', color: '#475569' },
];

const ProfileView: React.FC<ProfileViewProps> = ({ themeColor, onThemeChange }) => {
  const { user, updateProfile } = useFirebase();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');

  if (!user) return null;

  const handleSaveName = async () => {
    if (newName.trim() && newName !== user.displayName) {
      await updateProfile({ displayName: newName });
    }
    setIsEditingName(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header do Perfil */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6"
      >
        <img 
          src={user.photoURL || ''} 
          alt={user.displayName || ''} 
          className="w-24 h-24 rounded-full ring-4 ring-slate-100 shadow-inner"
        />
        <div className="text-center md:text-left flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-2xl font-bold text-slate-900 border-b-2 border-brand outline-none bg-transparent"
                autoFocus
              />
              <button 
                onClick={handleSaveName}
                className="p-1 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
              >
                <Check className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsEditingName(false)}
                className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <h2 className="text-2xl font-bold text-slate-900">{user.displayName}</h2>
              <button 
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-slate-400 hover:text-brand hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
              Sistema Offline (Modo Local/Mock)
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Escolha de Tema */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personalização</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Escolha a cor principal que será aplicada em botões, links e destaques em todo o sistema.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {THEME_COLORS.map((theme) => (
                <button
                  key={theme.color}
                  onClick={() => onThemeChange(theme.color)}
                  className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    themeColor === theme.color 
                    ? 'border-brand bg-brand/5' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full shadow-lg transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className={`text-[10px] font-bold uppercase ${
                    themeColor === theme.color ? 'text-brand' : 'text-slate-400'
                  }`}>
                    {theme.name}
                  </span>
                  {themeColor === theme.color && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sobre Nós */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sobre o Sistema</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-900">Versão</span>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-md font-mono font-bold">v3.0.0-gold</span>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              O <strong>Manutenção Salão</strong> é uma ferramenta desenhada para simplificar o cuidado com o Salão do Reino, 
              garantindo que todas as manutenções sejam realizadas no tempo certo com transparência e organização.
            </p>

            <a 
              href="#" 
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors text-slate-600 hover:text-indigo-600 group"
            >
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">Documentação</span>
              </div>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        {/* Políticas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 col-md-span-2 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Privacidade e Termos</h3>
          </div>

          <div className="prose prose-sm max-w-none text-slate-500 space-y-4">
            <p className="leading-relaxed">
              Os dados coletados por este sistema (nomes, e-mails e registros de manutenção) são de uso restrito da congregação 
              e servem exclusivamente para o planejamento das atividades de manutenção predial.
            </p>
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-xs text-red-600 font-medium">
                <strong>Atenção:</strong> Ao utilizar este sistema, você concorda que suas ações são registradas (logs) para fins de 
                integridade dos dados e auditoria interna.
              </p>
            </div>
            
            <button className="text-brand font-bold text-sm inline-flex items-center gap-2 hover:underline">
              Leia os Termos de Uso Completos <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileView;
