/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { memo, useState } from 'react';
import { MONTHS } from '../constants';
import { Check, Plus, Trash2, Info } from 'lucide-react';
import { AreaDesignation, MaintenanceTask, Frequency } from '../types';

interface Props {
  areaId: string;
  tasks: MaintenanceTask[];
  onTasksChange: (tasks: MaintenanceTask[]) => void;
  designation?: AreaDesignation;
}

const MaintenanceGrid = memo(({ areaId, tasks, onTasksChange, designation }: Props) => {
  const [activePressId, setActivePressId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskFreq, setNewTaskFreq] = useState<Frequency>('Mensal');

  const areaTasks = tasks.filter(t => t.areaId === areaId);

  const toggleMonth = (taskId: string, monthIndex: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const months = t.suggestedMonths.includes(monthIndex)
          ? t.suggestedMonths.filter(m => m !== monthIndex)
          : [...t.suggestedMonths, monthIndex];
        return { ...t, suggestedMonths: months };
      }
      return t;
    });
    onTasksChange(updatedTasks);
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const newTask: MaintenanceTask = {
      id: Math.random().toString(36).substr(2, 9),
      areaId,
      name: newTaskName,
      frequency: newTaskFreq,
      suggestedMonths: []
    };
    onTasksChange([...tasks, newTask]);
    setNewTaskName('');
  };

  const deleteTask = (taskId: string) => {
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Add Task Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Novo objeto da manutenção..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-brand transition-all"
          />
        </div>
        <select 
          value={newTaskFreq}
          onChange={(e) => setNewTaskFreq(e.target.value as Frequency)}
          className="px-4 py-2 border border-slate-200 rounded text-xs focus:outline-none font-bold text-slate-600"
        >
          <option value="Mensal">Mensal</option>
          <option value="Trimestral">Trimestral</option>
          <option value="Semestral">Semestral</option>
          <option value="Anual">Anual</option>
        </select>
        <button
          onClick={addTask}
          disabled={!newTaskName.trim()}
          style={{ backgroundColor: 'var(--area-color)' }}
          className="px-4 py-2 text-white rounded font-bold text-xs transition-all disabled:opacity-30 flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-3 h-3" />
          ADICIONAR SERVIÇO
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold border-r border-white/5">
                Objeto da Manutenção (Clique p/ ver equipe)
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold border-r border-white/5">
                Frequência
              </th>
              {MONTHS.map(month => (
                <th key={month} className="px-2 py-4 text-center text-[10px] uppercase tracking-widest font-bold border-r border-white/5 last:border-r-0 min-w-[50px]">
                  {month}
                </th>
              ))}
              <th className="px-4 py-4 text-center text-[10px] uppercase tracking-widest font-bold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {areaTasks.map((task, idx) => (
              <tr 
                key={task.id} 
                className={`group transition-colors ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'} hover:bg-slate-100/50`}
              >
                <td 
                  className="px-6 py-4 border-r border-slate-100 border-b text-xs font-bold text-slate-800 relative cursor-pointer select-none active:bg-brand-light"
                  onMouseDown={() => setActivePressId(task.id)}
                  onMouseUp={() => setActivePressId(null)}
                  onMouseLeave={() => setActivePressId(null)}
                  onTouchStart={() => setActivePressId(task.id)}
                  onTouchEnd={() => setActivePressId(null)}
                >
                  <div className="flex items-center gap-2">
                    {task.name}
                    <Info className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {activePressId === task.id && (
                    <div className="absolute left-6 top-12 bg-slate-900 text-white p-3 rounded shadow-xl z-[100] min-w-[200px] border border-brand/30">
                      <div className="text-[9px] uppercase font-bold text-brand mb-2">Equipe Responsável</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-[8px] uppercase font-bold text-slate-500">Homem Chave</div>
                          <div className="text-[10px] font-bold">{designation?.keyMan || 'Não designado'}</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase font-bold text-slate-500">Líder de Equipe</div>
                          <div className="text-[10px] font-bold">{designation?.leader || 'Não designado'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 border-r border-slate-100 border-b text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {task.frequency}
                </td>
                {MONTHS.map((_, mIdx) => {
                  const isSuggested = task.suggestedMonths.includes(mIdx);
                  return (
                    <td 
                      key={mIdx} 
                      className={`p-0 border-r border-slate-100 border-b last:border-r-0 transition-all`}
                      style={isSuggested ? { backgroundColor: 'color-mix(in srgb, var(--area-color), white 90%)' } : {}}
                    >
                      <div 
                        onClick={() => toggleMonth(task.id, mIdx)}
                        className="w-full h-full min-h-[48px] flex items-center justify-center cursor-pointer hover:bg-slate-50"
                      >
                        {isSuggested && (
                          <div 
                            className="w-5 h-5 rounded flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: 'var(--area-color)' }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-4 border-b text-center">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl">
          <div 
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--area-color)' }}
          >
            Instruções de Manutenção
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Esta tabela estabelece o programa de manutenção do Salão do Reino. Ela deve ser usada em conjunto com as fichas de trabalho e indica a frequência com que cada item deve ser inspecionado. Os meses indicados acima para execução de cada ficha são apenas uma sugestão. Clique e segure no nome do objeto para ver os responsáveis.
          </p>
        </div>
      </div>
    </div>
  );
});

MaintenanceGrid.displayName = 'MaintenanceGrid';

export default MaintenanceGrid;
