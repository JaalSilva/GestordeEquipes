/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Trash2, 
  FileDown,
  Info,
  Mail
} from 'lucide-react';
import { Meeting } from '../types';
import { exportMeetingsToPDF } from '../lib/meetingPDF';
import { ConfirmationModal } from './ConfirmationModal';

interface MeetingCalendarProps {
  meetings: Meeting[];
  onSaveMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ 
  meetings, 
  onSaveMeeting, 
  onDeleteMeeting 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const sendSpecificEmail = (meeting: Meeting) => {
    const date = new Date(meeting.date + 'T00:00:00').toLocaleDateString('pt-BR');
    const meetingText = `📅 ${meeting.title}\n🗓️ Data: ${date}\n⏰ Horário: ${meeting.startTime} às ${meeting.endTime}\n📍 Local: ${meeting.location || 'Não informado'}\n📝 Descrição: ${meeting.description || '-'}`;

    const subject = encodeURIComponent(`Informação de Reunião: ${meeting.title}`);
    const body = encodeURIComponent(`Olá,\n\nSeguem os detalhes da reunião agendada:\n\n${meetingText}\n\nEnviado via Sistema de Manutenção.`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setIsEmailModalOpen(false);
  };

  const handleSendEmail = () => {
    if (meetings.length === 0) {
      alert("Não há reuniões agendadas para enviar.");
      return;
    }
    setIsEmailModalOpen(true);
  };

  const [formMeeting, setFormMeeting] = useState<Partial<Meeting>>({
    type: 'regular',
    startTime: '08:00',
    endTime: '09:00',
    date: new Date().toISOString().split('T')[0]
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formMeeting.title && formMeeting.date && formMeeting.startTime && formMeeting.endTime) {
      onSaveMeeting({
        ...formMeeting as Meeting,
        id: editingMeeting?.id || crypto.randomUUID()
      });
      setIsModalOpen(false);
      setEditingMeeting(null);
      setFormMeeting({
        type: 'regular',
        startTime: '08:00',
        endTime: '09:00',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const numDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);

  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => null);

  const openAddModal = (dateStr?: string) => {
    setEditingMeeting(null);
    setFormMeeting({
      type: 'regular',
      startTime: '08:00',
      endTime: '09:00',
      date: dateStr || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormMeeting({ ...meeting });
    setIsModalOpen(true);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    openAddModal(dateStr);
  };

  const getMeetingsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meetings.filter(m => m.date === dateStr);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-brand p-2 rounded-lg text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-sans text-slate-900 uppercase tracking-tight">
            Agenda de Reuniões
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-xs border border-indigo-100 bg-white"
          >
            <Mail className="w-4 h-4" />
            ENVIAR POR E-MAIL
          </button>
          <button 
            onClick={() => exportMeetingsToPDF(meetings)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold text-xs border border-slate-200 bg-white"
          >
            <FileDown className="w-4 h-4" />
            EXPORTAR AGENDA
          </button>
          <button 
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand transition-all font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            NOVA REUNIÃO
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-slate-700 min-w-40 text-center uppercase tracking-wide">
            {months[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="text-xs font-bold text-brand hover:underline uppercase"
        >
          Hoje
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-50 last:border-0 italic">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 border-l border-t border-slate-50">
          {padding.map((_, i) => (
            <div key={`padding-${i}`} className="min-h-[120px] bg-slate-50/50 border-r border-b border-slate-50" />
          ))}
          {days.map(day => {
            const dayMeetings = getMeetingsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`cursor-pointer min-h-[120px] p-2 border-r border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors group relative ${isToday ? 'bg-brand-light' : ''}`}
              >
                <div className={`text-xs font-bold mb-2 flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-brand text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayMeetings.map(m => (
                    <div 
                      key={m.id}
                      onClick={(e) => { e.stopPropagation(); openEditModal(m); }}
                      className={`text-[9px] p-1.5 rounded border leading-tight flex flex-col gap-0.5 relative group/item cursor-pointer hover:shadow-md transition-shadow ${
                        m.type === 'emergency' ? 'bg-red-50 border-red-100 text-red-700' :
                        m.type === 'training' ? 'bg-green-50 border-green-100 text-green-700' :
                        'bg-brand-light border-brand/10 text-brand'
                      }`}
                    >
                      <span className="font-bold truncate">{m.title}</span>
                      <span className="opacity-70 flex items-center gap-1 font-mono">
                        <Clock className="w-2 h-2" /> {m.startTime}
                      </span>
                      <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); sendSpecificEmail(m); }}
                          className="p-1 text-indigo-500 hover:bg-white rounded shadow-sm border border-indigo-50 transition-all"
                          title="Enviar por E-mail"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeleteConfirmId(m.id);
                          }}
                          className="p-1 text-red-500 hover:bg-white rounded shadow-sm border border-red-50 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="text-brand w-5 h-5" />
                  {editingMeeting ? 'Editar Reunião' : 'Agendar Reunião'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <div className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
                    &times;
                  </div>
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título da Reunião</label>
                  <input
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formMeeting.title || ''}
                    onChange={e => setFormMeeting({...formMeeting, title: e.target.value})}
                    placeholder="Ex: Treinamento de Segurança"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formMeeting.date || ''}
                      onChange={e => setFormMeeting({...formMeeting, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formMeeting.type}
                      onChange={e => setFormMeeting({...formMeeting, type: e.target.value as any})}
                    >
                      <option value="regular">Regular</option>
                      <option value="emergency">Urgente</option>
                      <option value="training">Treinamento</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Início</label>
                    <input
                      required
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formMeeting.startTime || ''}
                      onChange={e => setFormMeeting({...formMeeting, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Término</label>
                    <input
                      required
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formMeeting.endTime || ''}
                      onChange={e => setFormMeeting({...formMeeting, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Local</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={formMeeting.location || ''}
                      onChange={e => setFormMeeting({...formMeeting, location: e.target.value})}
                      placeholder="Ex: Auditorial A"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descrição / Notas</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                    placeholder="Detalhes da pauta..."
                    value={formMeeting.description || ''}
                    onChange={e => setFormMeeting({...formMeeting, description: e.target.value})}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  {editingMeeting && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(editingMeeting.id)}
                      className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                      title="Excluir Reunião"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors uppercase tracking-widest border border-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 text-sm font-bold bg-brand text-white rounded-xl hover:bg-brand shadow-lg shadow-brand/20 uppercase tracking-widest transition-all"
                  >
                    {editingMeeting ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Selection Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="text-indigo-600 w-5 h-5" />
                  Selecionar Reunião para Enviar
                </h3>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full shadow-sm transition-all">
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {meetings
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(m => (
                    <button
                      key={m.id}
                      onClick={() => sendSpecificEmail(m)}
                      className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all flex items-start gap-4 text-left group"
                    >
                      <div className={`p-2 rounded-lg ${
                        m.type === 'emergency' ? 'bg-red-100 text-red-600' :
                        m.type === 'training' ? 'bg-green-100 text-green-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {m.startTime}
                          </span>
                          {m.location && (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider truncate">
                              <MapPin className="w-3 h-3" />
                              {m.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-all" />
                    </button>
                  ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            onDeleteMeeting(deleteConfirmId);
            setDeleteConfirmId(null);
            setIsModalOpen(false);
          }
        }}
        title="EXCLUIR REUNIÃO?"
        message="DESEJA REALMENTE EXCLUIR? FAÇA BACKUP ANTES! Esta ação não poderá ser desfeita."
      />
    </div>
  );
};
