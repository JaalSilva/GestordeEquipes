/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaintenanceArea, MaintenanceTask } from './types';

export const AREAS: MaintenanceArea[] = [
  { id: 'predial', name: 'PREDIAL', keyManId: 'valmir', leaderId: '', volunteerIds: [] },
  { id: 'hidraulica', name: 'HIDRÁULICA', keyManId: 'clodoaldo', leaderId: '', volunteerIds: [] },
  { id: 'eletrica', name: 'ELÉTRICA', keyManId: 'fernando', leaderId: '', volunteerIds: [] },
  { id: 'equipamentos', name: 'EQUIPAMENTOS', keyManId: 'alberico', leaderId: '', volunteerIds: [] },
  { id: 'eletronica', name: 'ELETRÔNICA', keyManId: 'elton', leaderId: '', volunteerIds: [] },
];

export const INITIAL_TASKS: MaintenanceTask[] = [
  // PREDIAL
  { id: 'p1', areaId: 'predial', name: 'Áreas Gramadas, Jardins e Árvores', frequency: 'Semestral', suggestedMonths: [0, 6] },
  { id: 'p2', areaId: 'predial', name: 'Cadeiras da Assistência', frequency: 'Anual', suggestedMonths: [5] },
  { id: 'p3', areaId: 'predial', name: 'Controle de Pragas', frequency: 'Anual', suggestedMonths: [5] },
  { id: 'p4', areaId: 'predial', name: 'Extintores de Incêndio', frequency: 'Anual', suggestedMonths: [11] },
  { id: 'p5', areaId: 'predial', name: 'Inspeção Externa', frequency: 'Semestral', suggestedMonths: [1, 7] },
  { id: 'p6', areaId: 'predial', name: 'Inspeção Interna', frequency: 'Semestral', suggestedMonths: [3, 9] },
  { id: 'p7', areaId: 'predial', name: 'Portas, Janelas e Portões', frequency: 'Semestral', suggestedMonths: [4, 10] },

  // HIDRÁULICA
  { id: 'h1', areaId: 'hidraulica', name: 'Ar-condicionado', frequency: 'Trimestral', suggestedMonths: [0, 3, 6, 9] },
  { id: 'h2', areaId: 'hidraulica', name: 'Bebedouro', frequency: 'Anual', suggestedMonths: [5] },
  { id: 'h3', areaId: 'hidraulica', name: 'Caixas de Passagem', frequency: 'Anual', suggestedMonths: [1] },
  { id: 'h4', areaId: 'hidraulica', name: 'Caixa D\'água', frequency: 'Anual', suggestedMonths: [3] },
  { id: 'h5', areaId: 'hidraulica', name: 'Fossas Sépticas e Sumidouros', frequency: 'Anual', suggestedMonths: [5] },
  { id: 'h6', areaId: 'hidraulica', name: 'Louças e Metais Sanitários', frequency: 'Semestral', suggestedMonths: [0, 6] },

  // ELÉTRICA
  { id: 'e1', areaId: 'eletrica', name: 'Instalações Elétricas', frequency: 'Semestral', suggestedMonths: [3, 9] },

  // EQUIPAMENTOS
  { id: 'eq1', areaId: 'equipamentos', name: 'Equipamentos', frequency: 'Semestral', suggestedMonths: [1, 7] },

  // ELETRÔNICA
  { id: 'el1', areaId: 'eletronica', name: 'Sistema de Monitoramento de Alarmes', frequency: 'Semestral', suggestedMonths: [0, 6] },
  { id: 'el2', areaId: 'eletronica', name: 'Sistema de Internet', frequency: 'Semestral', suggestedMonths: [4, 10] },
  { id: 'el3', areaId: 'eletronica', name: 'Sistema de Áudio e Vídeo', frequency: 'Semestral', suggestedMonths: [3, 11] },
];

export const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const CONGREGATIONS = [
  "Cajazeiras Nove",
  "Cajazeiras Oito",
  "Coqueiro Grande",
  "Fazenda Grande Dois",
  "Fazenda Grande Quarto",
  "Fazenda Grande Três",
  "Jaguaripe",
  "Parque São José"
].sort();
