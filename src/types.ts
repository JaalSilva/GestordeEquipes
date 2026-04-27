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
}

export interface AreaDesignation {
  areaId: string;
  keyMan: string;
  leader: string;
  volunteers: Volunteer[];
  updatedAt?: any;
}
