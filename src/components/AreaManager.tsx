/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Layout, 
  Check, 
  X,
  Type,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { MaintenanceArea } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

export const AreaManager = () => {
  const { areas, updateArea, deleteArea } = useFirebase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<MaintenanceArea | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<MaintenanceArea>>({
    name: '',
    color: '#0284c7',
    icon: 'Layout'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.color) {
      await updateArea({
        id: editingArea?.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        color: formData.color,
        keyManId: editingArea?.keyManId || '',
        leaderId: editingArea?.leaderId || '',
        volunteerIds: editingArea?.volunteerIds || []
      } as MaintenanceArea);
      
      setIsModalOpen(false);
      setEditingArea(null);
      setFormData({ name: '', color: '#0284c7', icon: 'Layout' });
    }
  };

  const handleEdit = (area: MaintenanceArea) => {
    setEditingArea(area);
    setFormData({ ...area });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteArea(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const colors = [
    '#0284c7', '#0891b2', '#0d9488', '#059669', '#16a34a', 
    '#65a30d', '#ca8a04', '#d97706', '#ea580c', '#dc2626',
    '#e11d48', '#c026d3', '#9333ea', '#7c3aed', '#4f46e5',
    '#2563eb', '#475569', '#1e293b'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestão de Setores</h2>
          <p className="text-sm text-slate-500 font-medium">Configure as áreas ativas de manutenção</p>
        </div>
        <button 
          onClick={() => {
            setEditingArea(null);
            setFormData({ name: '', color: '#0284c7', icon: 'Layout' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          NOVO SETOR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => (
          <div 
            key={area.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: area.color }}
                >
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 capitalize">{area.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: area.color }} 
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{area.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(area)}
                  className="p-2 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(area.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingArea ? 'Editar Setor' : 'Criar Novo Setor'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white rounded-full shadow-sm transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3 h-3" />
                    Nome do Setor
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    placeholder="Ex: Auditorio, Estacionamento..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    Cor de Identificação
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ring-offset-2 ${formData.color === color ? 'ring-2 ring-brand scale-110 shadow-md' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      >
                        {formData.color === color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-sm font-bold bg-brand text-white rounded-2xl hover:bg-brand hover:shadow-lg hover:shadow-brand/20 active:scale-95 transition-all shadow-md uppercase tracking-widest"
                  >
                    {editingArea ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="EXCLUIR SETOR?"
        message="DESEJA REALMENTE EXCLUIR? FAÇA BACKUP ANTES! Todas as designações e programações deste setor serão removidas permanentemente."
      />
    </div>
  );
};
