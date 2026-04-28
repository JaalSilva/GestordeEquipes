/**
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import { Meeting } from '../types';

export const exportMeetingsToPDF = (meetings: Meeting[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const sortedMeetings = [...meetings].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const drawHeader = (doc: jsPDF) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AGENDA DE REUNIÕES E TREINAMENTOS', 20, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CONTROLE DE MANUTENÇÃO - SISTEMA LOCAL', 20, 30);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 70, 30);
  };

  drawHeader(doc);
  
  let y = 55;
  doc.setTextColor(15, 23, 42);

  if (sortedMeetings.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma reunião agendada para o período.', 20, y);
  }

  sortedMeetings.forEach((meeting, index) => {
    if (y > 250) {
      doc.addPage();
      drawHeader(doc);
      y = 55;
      doc.setTextColor(15, 23, 42);
    }

    // Card background for each meeting
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, y - 5, pageWidth - 30, 35, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, y - 5, pageWidth - 30, 35, 'S');

    // Type indicator color
    if (meeting.type === 'emergency') doc.setFillColor(239, 68, 68); // red-500
    else if (meeting.type === 'training') doc.setFillColor(34, 197, 94); // green-500
    else doc.setFillColor(59, 130, 246); // blue-500
    doc.rect(15, y - 5, 2, 35, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(meeting.title, 22, y + 2);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    
    const formattedDate = new Date(meeting.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    doc.text(`Data: ${formattedDate}`, 22, y + 10);
    doc.text(`Horário: ${meeting.startTime} até ${meeting.endTime}`, 22, y + 16);
    doc.text(`Local: ${meeting.location}`, 22, y + 22);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Observações: ${meeting.description || 'Nenhuma'}`, 22, y + 28);

    y += 45;
  });

  doc.save('agenda-reunioes.pdf');
};
