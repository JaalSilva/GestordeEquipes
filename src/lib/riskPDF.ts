/**
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';

export interface RiskAnalysis {
  serviceDescription: string;
  location: string;
  startDate: string;
  emergencyNumbers: string;
  steps: { action: string; risks: string; controls: string }[];
  preparedBy: string;
  preparedDate: string;
  revisedBy: string;
  revisedDate: string;
}

export const exportRiskAnalysisToPDF = (data: RiskAnalysis) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise de Risco em Serviços no Salão do Reino', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('(O documento Análise de Risco em Serviços no Salão do Reino (DC-85i) deve ser usado quando for preencher este formulário.)', pageWidth / 2, 26, { align: 'center' });

  // Fields Table
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 240);
  
  const drawField = (label: string, value: string, x: number, y: number, w: number) => {
    doc.rect(x, y, 40, 8, 'F');
    doc.rect(x, y, 40, 8, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(label, x + 2, y + 5);
    
    doc.rect(x + 40, y, w - 40, 8, 'S');
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + 42, y + 5);
  };

  drawField('DESCRIÇÃO DO SERVIÇO', data.serviceDescription, 10, 35, 150);
  drawField('LOCAL DO SERVIÇO', data.location, 10, 43, 150);
  drawField('DATA PROGRAMADA', data.startDate, 10, 51, 150);
  drawField('NÚMERO(S) EMERGÊNCIA', data.emergencyNumbers, 10, 59, 150);

  // Risk Pyramid Simulation (Graphic Representation)
  const px = 200;
  const py = 35;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('ELIMINAÇÃO', px + 30, py + 5, { align: 'center' });
  doc.text('SUBSTITUIÇÃO', px + 30, py + 12, { align: 'center' });
  doc.text('ENGENHARIA', px + 30, py + 19, { align: 'center' });
  doc.setFontSize(7);
  doc.text('ADMINISTRATIVO', px + 30, py + 26, { align: 'center' });
  doc.text('EPI', px + 30, py + 33, { align: 'center' });
  doc.setTextColor(0);

  // Main Grid Header
  const gridY = 75;
  doc.setFillColor(220, 220, 220);
  doc.rect(10, gridY, 80, 10, 'F');
  doc.rect(90, gridY, 80, 10, 'F');
  doc.rect(170, gridY, 117, 10, 'F');
  
  doc.rect(10, gridY, 80, 10, 'S');
  doc.rect(90, gridY, 80, 10, 'S');
  doc.rect(170, gridY, 117, 10, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('ETAPAS DO SERVIÇO', 50, gridY + 6, { align: 'center' });
  doc.text('RISCOS', 130, gridY + 6, { align: 'center' });
  doc.text('MEDIDAS DE CONTROLE', 228, gridY + 6, { align: 'center' });

  // Rows
  let rowY = gridY + 10;
  for (let i = 0; i < 5; i++) {
    const step = data.steps[i] || { action: '', risks: '', controls: '' };
    doc.rect(10, rowY, 80, 15, 'S');
    doc.rect(90, rowY, 80, 15, 'S');
    doc.rect(170, rowY, 117, 15, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.text(step.action, 12, rowY + 5, { maxWidth: 76 });
    doc.text(step.risks, 92, rowY + 5, { maxWidth: 76 });
    doc.text(step.controls, 172, rowY + 5, { maxWidth: 113 });
    rowY += 15;
  }

  // Footer
  const footerY = rowY + 5;
  const drawFooterField = (label: string, value: string, x: number, y: number, w: number) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(x, y, w / 2.5, 8, 'F');
    doc.rect(x, y, w / 2.5, 8, 'S');
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 2, y + 5);
    
    doc.rect(x + w / 2.5, y, w - w / 2.5, 8, 'S');
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + w / 2.5 + 2, y + 5);
  };

  drawFooterField('PREPARADO POR', data.preparedBy, 10, footerY, 70);
  drawFooterField('DATA', data.preparedDate, 80, footerY, 60);
  drawFooterField('REVISADO POR', data.revisedBy, 150, footerY, 70);
  drawFooterField('DATA', data.revisedDate, 220, footerY, 67);

  doc.setFontSize(7);
  doc.text('DC-85-T 4/22', 10, 200);

  doc.save('analise-de-risco.pdf');
};
