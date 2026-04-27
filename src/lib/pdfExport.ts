/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import { AreaDesignation, MaintenanceArea, MaintenanceTask } from '../types';
import { AREAS, MONTHS } from '../constants';

export const exportAreaToPDF = async (area: MaintenanceArea, designation: AreaDesignation | null, tasks: MaintenanceTask[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const currentMonthIndex = new Date().getMonth();
  const timestamp = new Date().toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const drawHeader = (doc: jsPDF, areaName: string) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA DE CONTROLE DE MANUTENÇÃO', 20, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Setor: ${areaName}`, 20, 30);
    doc.text(`Emitido em: ${timestamp}`, pageWidth - 70, 30);
  };

  drawHeader(doc, area.name);
  
  // Liderança
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. LIDERANÇA DO SETOR', 20, 55);
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 57, pageWidth - 20, 57);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Homem Chave: ${designation?.keyMan || 'Não designado'}`, 25, 65);
  doc.text(`Líder de Equipe: ${designation?.leader || 'Não designado'}`, 25, 72);
  
  // Cronograma
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. CRONOGRAMA DE MANUTENÇÃO', 20, 90);
  doc.line(20, 92, pageWidth - 20, 92);

  const areaTasks = tasks.filter(t => t.areaId === area.id);
  const currentMonthTasks: string[] = [];
  
  // Table Header for Tasks
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('OBJETO DA MANUTENÇÃO', 20, 100);
  doc.text('FREQ.', 80, 100);
  MONTHS.forEach((m, i) => {
    doc.text(m, 100 + (i * 8), 100);
  });

  let taskY = 105;
  doc.setDrawColor(241, 245, 249);
  
  areaTasks.forEach((task) => {
    const isScheduledNow = task.suggestedMonths.includes(currentMonthIndex);
    if (isScheduledNow) {
      currentMonthTasks.push(task.name);
      doc.setFillColor(255, 255, 0); // Yellow highlight
      doc.rect(19, taskY - 3.5, pageWidth - 39, 5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(task.name.substring(0, 35), 20, taskY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(task.frequency, 80, taskY);

    MONTHS.forEach((_, i) => {
      const isSuggested = task.suggestedMonths.includes(i);
      if (isSuggested) {
        doc.setFillColor(isScheduledNow ? 0 : 59, isScheduledNow ? 0 : 130, isScheduledNow ? 0 : 246); // Black dots if highlighted, blue otherwise
        doc.rect(100 + (i * 8) - 1, taskY - 2.5, 4, 3, 'F');
      } else {
        doc.setDrawColor(226, 232, 240);
        doc.rect(100 + (i * 8) - 1, taskY - 2.5, 4, 3, 'S');
      }
    });

    taskY += 6;
    if (taskY > 275) {
      doc.addPage();
      drawHeader(doc, area.name);
      taskY = 55;
    }
  });

  if (areaTasks.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhum serviço cadastrado.', 25, 105);
    taskY = 115;
  } else {
    taskY += 4;
    
    // Observation for current month tasks
    if (currentMonthTasks.length > 0) {
      doc.setFillColor(254, 249, 195); // Light yellow box
      doc.setDrawColor(234, 179, 8); // Yellow border
      doc.rect(20, taskY, pageWidth - 40, 10, 'FD');
      doc.setTextColor(133, 77, 14); // Dark brown/yellow text
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const taskList = currentMonthTasks.join(', ');
      doc.text(`OBSERVAÇÃO: Solicite a ficha de: ${taskList}`, 25, taskY + 6);
      taskY += 16;
    } else {
      taskY += 6;
    }
  }
  
  // Voluntários
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. VOLUNTÁRIOS DESIGNADOS', 20, taskY);
  doc.line(20, taskY + 2, pageWidth - 20, taskY + 2);
  
  const volunteers = designation?.volunteers || [];
  let volY = taskY + 10;
  
  volunteers.forEach((v, i) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${v.name}`, 25, volY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Congregação: ${v.congregation}`, 25, volY + 4);
    doc.setTextColor(15, 23, 42);
    volY += 12;
    
    if (volY > 275) {
      doc.addPage();
      drawHeader(doc, area.name);
      volY = 50;
    }
  });

  if (volunteers.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhum voluntário designado.', 25, volY);
  }
  
  doc.save(`relatorio-${area.id}.pdf`);
};

export const exportAllToPDF = async (allDesignations: Record<string, AreaDesignation>, allTasks: MaintenanceTask[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const currentMonthIndex = new Date().getMonth();
  const timestamp = new Date().toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const drawHeader = (doc: jsPDF, areaName: string) => {
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO GERAL DE MANUTENÇÃO', 20, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Setor: ${areaName}`, 20, 30);
    doc.text(`Emitido em: ${timestamp}`, pageWidth - 70, 30);
  };
  
  AREAS.forEach((area, index) => {
    if (index > 0) doc.addPage();
    
    const designation = allDesignations[area.id] || null;
    const areaTasks = allTasks.filter(t => t.areaId === area.id);
    const currentMonthTasks: string[] = [];
    
    drawHeader(doc, area.name);
    
    // Leadership
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LIDERANÇA DO SETOR', 20, 55);
    doc.setDrawColor(226, 232, 240); 
    doc.line(20, 57, pageWidth - 20, 57);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Homem Chave: ${designation?.keyMan || 'Não designado'}`, 25, 65);
    doc.text(`Líder de Equipe: ${designation?.leader || 'Não designado'}`, 25, 72);
    
    // Tasks
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE MANUTENÇÃO', 20, 85);
    doc.line(20, 87, pageWidth - 20, 87);

    // Table Header
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('OBJETO DA MANUTENÇÃO', 20, 95);
    doc.text('FREQ.', 80, 95);
    MONTHS.forEach((m, ii) => {
      doc.text(m, 100 + (ii * 8), 95);
    });

    let taskY = 100;
    areaTasks.slice(0, 20).forEach((task) => { // Sample 20 for space safety
      const isScheduledNow = task.suggestedMonths.includes(currentMonthIndex);
      if (isScheduledNow) {
        currentMonthTasks.push(task.name);
        doc.setFillColor(255, 255, 0); // Yellow highlight
        doc.rect(19, taskY - 3.5, pageWidth - 39, 5, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text(task.name.substring(0, 35), 20, taskY);
      doc.text(task.frequency, 80, taskY);
      MONTHS.forEach((_, ii) => {
        if (task.suggestedMonths.includes(ii)) {
          doc.setFillColor(isScheduledNow ? 0 : 59, isScheduledNow ? 0 : 130, isScheduledNow ? 0 : 246);
          doc.rect(100 + (ii * 8) - 1, taskY - 2.5, 4, 3, 'F');
        } else {
          doc.setDrawColor(226, 232, 240);
          doc.rect(100 + (ii * 8) - 1, taskY - 2.5, 4, 3, 'S');
        }
      });
      taskY += 6;
    });

    if (areaTasks.length > 20) {
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`... e mais ${areaTasks.length - 20} itens (veja relatório individual)`, 20, taskY);
      taskY += 6;
    } else {
      taskY += 2;
    }

    // Observation for current month tasks
    if (currentMonthTasks.length > 0) {
      doc.setFillColor(254, 249, 195);
      doc.setDrawColor(234, 179, 8);
      doc.rect(20, taskY, pageWidth - 40, 8, 'FD');
      doc.setTextColor(133, 77, 14);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const taskList = currentMonthTasks.join(', ');
      doc.text(`OBSERVAÇÃO: Solicite a ficha de: ${taskList}`, 25, taskY + 5);
      taskY += 12;
    } else {
      taskY += 4;
    }

    // Volunteers
    taskY += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('EQUIPE DE VOLUNTÁRIOS', 20, taskY);
    doc.line(20, taskY + 2, pageWidth - 20, taskY + 2);
    
    const volunteers = designation?.volunteers || [];
    let volY = taskY + 8;
    
    volunteers.slice(0, 10).forEach((v, vi) => {
      doc.setFontSize(9);
      doc.text(`${vi + 1}. ${v.name} (${v.congregation})`, 25, volY);
      volY += 6;
    });

    if (volunteers.length > 10) {
      doc.setFontSize(7);
      doc.text(`... outros ${volunteers.length - 10} voluntários`, 25, volY);
    }
  });
  
  doc.save(`relatorio-geral-manutencao.pdf`);
};
