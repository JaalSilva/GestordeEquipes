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

interface MeetingCalendarProps {
  meetings: Meeting[];
  onAddMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ 
  meetings, 
  onAddMeeting, 
  onDeleteMeeting 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);

  const handleSendEmail = () => {
    if (meetings.length === 0) {
      alert("Não há reuniões agendadas para enviar.");
      return;
    }

    const meetingText = meetings
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => {
        const date = new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR');
        return `📅 ${m.title}\n🗓️ Data: ${date}\n⏰ Horário: ${m.startTime} às ${m.endTime}\n📍 Local: ${m.location || 'Não informado'}\n📝 Descrição: ${m.description || '-'}\n--------------------------`;
      })
      .join('\n\n');

    const subject = encodeURIComponent("Agenda de Reuniões - Manutenção Salão");
    const body = encodeURIComponent(`Olá,\n\nSegue a agenda de reuniões de manutenção:\n\n${meetingText}\n\nEnviado via Sistema de Manutenção.`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeeting.title && newMeeting.date && newMeeting.startTime && newMeeting.endTime) {
      onAddMeeting({
        ...newMeeting as Meeting,
        id: crypto.randomUUID()
      });
      setIsAdding(false);
      setNewMeeting({
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
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewMeeting({
      ...newMeeting,
      date: dateStr
    });
    setIsAdding(true);
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
            onClick={() => setIsAdding(true)}
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
                      className={`text-[9px] p-1.5 rounded border leading-tight flex flex-col gap-0.5 relative group/item ${
                        m.type === 'emergency' ? 'bg-red-50 border-red-100 text-red-700' :
                        m.type === 'training' ? 'bg-green-50 border-green-100 text-green-700' :
                        'bg-brand-light border-brand/10 text-brand'
                      }`}
                    >
                      <span className="font-bold truncate">{m.title}</span>
                      <span className="opacity-70 flex items-center gap-1 font-mono">
                        <Clock className="w-2 h-2" /> {m.startTime}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteMeeting(m.id); }}
                        className="absolute hidden group-item-hover:flex top-1 right-1 text-red-400 hover:text-red-600 bg-white rounded p-0.5 shadow-sm border border-red-50"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="text-brand w-5 h-5" />
                  Agendar Reunião
                </h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                  <div className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
                    &times;
                  </div>
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título da Reunião</label>
                  <input
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newMeeting.title || ''}
                    onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
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
                      value={newMeeting.date || ''}
                      onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newMeeting.type}
                      onChange={e => setNewMeeting({...newMeeting, type: e.target.value as any})}
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
                      value={newMeeting.startTime || ''}
                      onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Término</label>
                    <input
                      required
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newMeeting.endTime || ''}
                      onChange={e => setNewMeeting({...newMeeting, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Local</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={newMeeting.location || ''}
                      onChange={e => setNewMeeting({...newMeeting, location: e.target.value})}
                      placeholder="Ex: Auditorial A"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descrição / Notas</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                    placeholder="Detalhes da pauta..."
                    value={newMeeting.description || ''}
                    onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-sm font-bold bg-brand text-white rounded-xl hover:bg-brand shadow-lg shadow-brand/20 uppercase tracking-widest transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
