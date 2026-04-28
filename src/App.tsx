/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, ChangeEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Users, 
  Calendar, 
  Settings, 
  ChevronRight, 
  UserPlus, 
  Shield, 
  HardHat,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Loader2,
  Save,
  FileDown,
  Printer,
  FileStack,
  ClipboardCheck,
  LayoutDashboard,
  User as UserIcon,
  Palette,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AREAS, INITIAL_TASKS } from './constants';
import { MaintenanceTask, AreaDesignation, Meeting } from './types';
import { useFirebase } from './components/FirebaseProvider';

// Components
import TeamManager from './components/TeamManager';
import MaintenanceGrid from './components/MaintenanceGrid';
import { SafetyManualView } from './components/SafetyManualView';
import { RiskAnalysisForm } from './components/RiskAnalysisForm';
import { MeetingCalendar } from './components/MeetingCalendar';
import ProfileView from './components/ProfileView';

import { exportAreaToPDF, exportAllToPDF } from './lib/pdfExport';

export default function App() {
  const { 
    user, 
    loading, 
    tasks, 
    designations, 
    meetings, 
    updateTask,
    updateDesignation,
    updateMeeting,
    deleteMeeting
  } = useFirebase();

  const [activeAreaId, setActiveAreaId] = useState(AREAS[0].id);
  const [view, setView] = useState<'schedule' | 'team' | 'manual' | 'risk' | 'calendar' | 'profile'>('schedule');
  const [themeColor, setThemeColor] = useState<string>(localStorage.getItem('themeColor') || '#2563eb');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeArea = useMemo(() => 
    AREAS.find(a => a.id === activeAreaId) || AREAS[0],
  [activeAreaId]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
    document.documentElement.style.setProperty('--primary-color', themeColor);
    
    const r = parseInt(themeColor.slice(1, 3), 16);
    const g = parseInt(themeColor.slice(3, 5), 16);
    const b = parseInt(themeColor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-color-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
    document.documentElement.style.setProperty('--primary-color-hover', themeColor);
  }, [themeColor]);

  // Firebase Handlers
  const handleUpdateTasks = useCallback((newTasks: MaintenanceTask[]) => {
    // MaintenanceGrid sends the whole task list usually, or we can update one by one.
    // For now, let's assume it sends the whole list and we find which one changed.
    newTasks.forEach(task => {
      const existing = tasks.find(t => t.id === task.id);
      if (JSON.stringify(existing) !== JSON.stringify(task)) {
        updateTask(task);
      }
    });
  }, [tasks, updateTask]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  const handleBackupExport = async () => {
    const backupData = { designations, tasks, meetings };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mante_salao_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    setIsExporting(true);
    await exportAllToPDF(designations, tasks);
    setIsExporting(false);
  };

  const handleBackupImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Bulk update to Firestore (simplified for now)
        if (json.tasks) {
          for (const task of json.tasks) await updateTask(task);
        }
        if (json.designations) {
          for (const areaId in json.designations) await updateDesignation(json.designations[areaId]);
        }
        if (json.meetings) {
          for (const m of json.meetings) await updateMeeting(m);
        }
        alert('Dados importados e sincronizados com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportActivePDF = async () => {
    setIsExporting(true);
    await exportAreaToPDF(activeArea, designations[activeAreaId] || null, tasks);
    setIsExporting(false);
  };

  const handleExportAllPDF = async () => {
    setIsExporting(true);
    await exportAllToPDF(designations, tasks);
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand selection:text-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand rounded-sm" />
          <h1 className="font-bold text-xs tracking-tight text-white uppercase">Manutenção Salão</h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white hover:bg-slate-800 rounded"
          >
            {sidebarOpen ? <ChevronRight className="w-6 h-6 rotate-180" /> : <Settings className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand rounded-sm" />
              <h1 className="font-bold text-sm tracking-tight text-white uppercase">Manutenção Salão</h1>
            </div>
          </div>
          
            <button 
              onClick={() => {
                setView('profile');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 p-3 w-full bg-slate-800/50 rounded-xl border transition-all ${
                view === 'profile' ? 'border-brand ring-1 ring-brand' : 'border-slate-700 hover:bg-slate-800'
              }`}
            >
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-slate-700" />
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-tighter font-bold">Ver Perfil</p>
              </div>
            </button>
        </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 lg:py-6 space-y-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 px-2">Gestão</div>
            <button
              onClick={() => {
                setView('calendar');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded transition-all duration-200 group ${
                view === 'calendar' 
                ? 'bg-brand text-white shadow-sm' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-sm">Agenda de Reuniões</span>
              </div>
            </button>

            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 px-2 mt-6">Setores Ativos</div>
            {AREAS.map((area) => {
              const isActive = activeAreaId === area.id && view !== 'manual' && view !== 'risk' && view !== 'calendar';
              return (
                <button
                  key={area.id}
                  onClick={() => {
                    setActiveAreaId(area.id);
                    if (view === 'manual' || view === 'risk' || view === 'calendar') setView('schedule');
                    setSidebarOpen(false);
                  }}
                  style={isActive ? { backgroundColor: area.color } : {}}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded transition-all duration-200 group ${
                    isActive
                    ? 'text-white shadow-sm' 
                    : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="font-medium text-sm">{area.name}</span>
                  </div>
                  {isActive && (
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">ATIVO</span>
                  )}
                </button>
              );
            })}
          
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 px-2">Documentação</div>
            <button
              onClick={() => {
                setView('manual');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded transition-all duration-200 ${
                view === 'manual' 
                ? 'bg-brand text-white shadow-sm' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium text-sm">Manual de Segurança</span>
            </button>
            <button
              onClick={() => {
                setView('risk');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded transition-all duration-200 ${
                view === 'risk' 
                ? 'bg-orange-600 text-white shadow-sm' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="font-medium text-sm">Alto Risco (DC-85)</span>
            </button>
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-slate-800 bg-slate-900/50 space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBackupImport} 
            accept=".json" 
            className="hidden" 
          />
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:bg-slate-700 transition-colors shadow-sm"
            >
              <FileDown className="w-3 h-3" />
              IMPORTAR DADOS (JSON)
            </button>
            <button 
              onClick={handleBackupExport}
              className="w-full flex items-center justify-center gap-2 p-2 bg-brand rounded text-[10px] font-bold text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Save className="w-3 h-3" />
              EXPORTAR BACKUP
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main 
        className={`lg:pl-64 min-h-screen flex flex-col pt-16 lg:pt-0`}
        style={{ '--area-color': activeArea.color } as React.CSSProperties}
      >
        {view !== 'manual' && view !== 'risk' && view !== 'calendar' && view !== 'profile' && (
          <header className="sticky top-0 lg:top-0 bg-slate-50/80 backdrop-blur-md z-40 px-4 lg:px-10 py-6 lg:py-8 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
              <div>
                <div 
                  className="text-[9px] lg:text-xs font-semibold mb-1 uppercase tracking-widest"
                  style={{ color: activeArea.color }}
                >
                  {view === 'schedule' ? 'CRONOGRAMA DO SETOR' : 'DESIGNAÇÃO DE EQUIPE'}
                </div>
                <h2 className="text-xl lg:text-3xl font-bold text-slate-900 tracking-tight uppercase leading-none">{activeArea.name}</h2>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setView('schedule')}
                  style={view === 'schedule' ? { backgroundColor: activeArea.color, borderColor: activeArea.color } : {}}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded font-bold text-[10px] transition-all border ${
                    view === 'schedule' 
                    ? 'text-white shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  CRONOGRAMA
                </button>
                <button
                  onClick={() => setView('team')}
                  style={view === 'team' ? { backgroundColor: activeArea.color, borderColor: activeArea.color } : {}}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded font-bold text-[10px] transition-all border ${
                    view === 'team' 
                    ? 'text-white shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  EQUIPE (15)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-1 lg:flex-none bg-white border border-slate-200 rounded p-1 shadow-sm items-center">
                <button 
                  onClick={handleExportActivePDF}
                  disabled={isExporting}
                  title="Exportar PDF do Setor"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors disabled:opacity-30 text-[10px] font-bold"
                >
                  <Printer className="w-4 h-4" />
                  PDF ATUAL
                </button>
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <button 
                  onClick={handleExportAllPDF}
                  disabled={isExporting}
                  title="Exportar PDF Geral"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors disabled:opacity-30 text-[10px] font-bold"
                >
                  <FileStack className="w-4 h-4" />
                  PDF GERAL
                </button>
              </div>

              {isExporting && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    <p className="font-bold text-sm uppercase tracking-widest">Gerando Documentos...</p>
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        <section className="p-4 lg:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeAreaId}-${view}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {view === 'schedule' ? (
                <MaintenanceGrid 
                  key={`grid-${activeAreaId}`}
                  areaId={activeAreaId} 
                  tasks={tasks}
                  onTasksChange={handleUpdateTasks}
                  designation={designations[activeAreaId]}
                />
              ) : view === 'team' ? (
                <TeamManager 
                  key={`team-${activeAreaId}`}
                  areaId={activeAreaId} 
                  initialData={designations[activeAreaId]}
                  onDataChange={updateDesignation}
                />
              ) : view === 'manual' ? (
                <SafetyManualView />
              ) : view === 'calendar' ? (
                <MeetingCalendar 
                  meetings={meetings} 
                  onAddMeeting={updateMeeting} 
                  onDeleteMeeting={deleteMeeting} 
                />
              ) : view === 'profile' ? (
                <ProfileView 
                  themeColor={themeColor} 
                  onThemeChange={setThemeColor} 
                />
              ) : (
                <RiskAnalysisForm />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
