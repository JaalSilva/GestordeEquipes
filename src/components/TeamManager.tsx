/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useEffect } from 'react';
import { 
  Shield, 
  HardHat, 
  Plus, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import { AreaDesignation, Volunteer } from '../types';
import { CONGREGATIONS } from '../constants';

interface Props {
  areaId: string;
  initialData?: AreaDesignation;
  onDataChange: (data: AreaDesignation) => void;
}

const TeamManager = memo(({ areaId, initialData, onDataChange }: Props) => {
  const [keyMan, setKeyMan] = useState(initialData?.keyMan || '');
  const [leader, setLeader] = useState(initialData?.leader || '');
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialData?.volunteers || []);
  const [newVolunteer, setNewVolunteer] = useState('');
  const [newCongregation, setNewCongregation] = useState('');

  // Handle external data changes (like imports) while keeping active state
  useEffect(() => {
    if (initialData) {
      if (initialData.keyMan !== keyMan) setKeyMan(initialData.keyMan);
      if (initialData.leader !== leader) setLeader(initialData.leader);
      if (JSON.stringify(initialData.volunteers) !== JSON.stringify(volunteers)) {
        setVolunteers(initialData.volunteers);
      }
    }
  }, [initialData]);

  // Unified update helper to notify parent
  const notifyParent = (k: string, l: string, v: Volunteer[]) => {
    onDataChange({
      areaId,
      keyMan: k,
      leader: l,
      volunteers: v,
      updatedAt: new Date().toISOString()
    });
  };

  const handleKeyManChange = (val: string) => {
    setKeyMan(val);
    notifyParent(val, leader, volunteers);
  };

  const handleLeaderChange = (val: string) => {
    setLeader(val);
    notifyParent(keyMan, val, volunteers);
  };

  const addVolunteer = () => {
    if (newVolunteer.trim() && newCongregation.trim() && volunteers.length < 15) {
      const updated = [...volunteers, { name: newVolunteer.trim(), congregation: newCongregation.trim() }];
      setVolunteers(updated);
      setNewVolunteer('');
      setNewCongregation('');
      notifyParent(keyMan, leader, updated);
    }
  };

  const removeVolunteer = (index: number) => {
    const updated = volunteers.filter((_, i) => i !== index);
    setVolunteers(updated);
    notifyParent(keyMan, leader, updated);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Leadership Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-lg">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Homem Chave (Responsável Técnico)</label>
          <div className="flex items-center gap-4 border-2 border-dashed border-slate-100 p-4 rounded bg-slate-50/30 transition-all hover:border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ex: Ricardo J. Santos"
                value={keyMan}
                onChange={(e) => handleKeyManChange(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-slate-900 font-bold text-lg focus:ring-0 placeholder:text-slate-300"
              />
              <div className="text-slate-500 text-xs mt-1">Designação Técnica</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-lg">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Líder de Equipe (Gestão de Campo)</label>
          <div className="flex items-center gap-4 border-2 border-dashed border-slate-100 p-4 rounded bg-slate-50/30 transition-all hover:border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
              <HardHat className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ex: Ana Paula Mendes"
                value={leader}
                onChange={(e) => handleLeaderChange(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-slate-900 font-bold text-lg focus:ring-0 placeholder:text-slate-300"
              />
              <div className="text-slate-500 text-xs mt-1">Gestão de Voluntários</div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteers Section */}
      <section className="bg-white p-4 lg:p-6 border border-slate-200 shadow-sm rounded-lg flex flex-col">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-6">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Quadro de Voluntários Designados</h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(volunteers.length / 15) * 100}%`,
                    backgroundColor: 'var(--area-color)'
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{volunteers.length} / 15</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex flex-col gap-2 flex-1 lg:flex-none">
              <input
                type="text"
                placeholder="Nome completo..."
                value={newVolunteer}
                onChange={(e) => setNewVolunteer(e.target.value)}
                disabled={volunteers.length >= 15}
                className="px-4 py-2 border border-slate-200 rounded text-xs focus:outline-none transition-all disabled:opacity-50 w-full lg:min-w-[200px]"
                style={{ '--tw-ring-color': 'var(--area-color)' } as React.CSSProperties}
              />
              <select
                value={newCongregation}
                onChange={(e) => setNewCongregation(e.target.value)}
                disabled={volunteers.length >= 15}
                className="px-4 py-2 border border-slate-200 rounded text-xs focus:outline-none transition-all disabled:opacity-50 w-full lg:min-w-[200px] bg-white text-slate-800 font-medium"
                style={{ '--tw-ring-color': 'var(--area-color)' } as React.CSSProperties}
              >
                <option value="">Selecione a Congregação...</option>
                {CONGREGATIONS.map(cong => (
                  <option key={cong} value={cong}>{cong}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addVolunteer}
              disabled={volunteers.length >= 15 || !newVolunteer.trim() || !newCongregation.trim()}
              className="px-4 h-[68px] bg-slate-900 text-white rounded hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {volunteers.map((v, index) => (
            <div 
              key={index}
              className="group border border-slate-200 rounded p-4 flex flex-col justify-center items-center text-center relative hover:bg-slate-50 transition-all"
              style={{ borderColor: 'color-mix(in srgb, var(--area-color), #000 0%)' }} // default border
            >
              <button 
                onClick={() => removeVolunteer(index)}
                className="absolute top-1 right-1 text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="text-xs font-bold text-slate-800 mb-0.5 line-clamp-1">{index + 1}. {v.name}</div>
              <div className="text-[9px] text-slate-400 font-medium uppercase mb-2 line-clamp-1">{v.congregation}</div>
              <div 
                className="text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1"
                style={{ color: 'var(--area-color)' }}
              >
                <CheckCircle2 className="w-2 h-2" />
                TREINADO
              </div>
            </div>
          ))}
          
          {Array.from({ length: 15 - volunteers.length }).map((_, i) => (
            <div 
              key={`empty-${i}`}
              className="border border-slate-100 border-dashed rounded p-4 flex flex-col justify-center items-center text-center bg-slate-50/30 min-h-[100px]"
            >
              <div className="text-xs font-bold text-slate-300 mb-1">[{volunteers.length + i + 1}] Vago</div>
              <div className="text-[9px] text-slate-300 uppercase tracking-tighter">Aguardando</div>
            </div>
          ))}
        </div>
        
        <footer className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-4">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--area-color)' }}></div> {volunteers.length} Designados</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div> {15 - volunteers.length} Disponíveis</span>
          </div>
          <div>Sistema de Gestão de Voluntários • Ficha S-44</div>
        </footer>
      </section>
    </div>
  );
});

TeamManager.displayName = 'TeamManager';

export default TeamManager;
