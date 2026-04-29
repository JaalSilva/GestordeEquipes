/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Person {
  id: string;
  name: string;
  role: 'KeyMan' | 'Leader' | 'Volunteer';
}

export interface Volunteer {
  name: string;
  congregation: string;
}

export interface MaintenanceArea {
  id: string;
  name: string;
  color: string;
  keyManId: string;
  leaderId: string;
  volunteerIds: string[]; // Deprecated if using designates
}

export type Frequency = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export interface MaintenanceTask {
  id: string;
  areaId: string;
  name: string;
  frequency: Frequency;
  suggestedMonths: number[]; // 0-11
  completedMonths?: Record<number, { year: number, date: string, responsible: string }>;
}

export interface AreaDesignation {
  areaId: string;
  keyMan: string;
  leader: string;
  volunteers: Volunteer[];
  updatedAt?: any;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO string (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  description: string;
  type: 'emergency' | 'regular' | 'training';
}
