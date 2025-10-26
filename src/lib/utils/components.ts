import type { ComponentType } from '../types';
import type { Component as LucideComponent } from 'lucide-svelte';
import { Lightbulb, Wind, Fan, AlarmSmoke, CircleSlash2 } from 'lucide-svelte';

export interface ComponentInfo {
  icon: typeof LucideComponent;
  label: string;
  description: string;
  bgColor: string; // Background color (light shade, e.g., red-100)
  iconColor: string; // Icon color (darker shade, e.g., red-600)
  selectedBgColor: string; // Selected background (slightly darker)
  selectedBorderColor: string; // Selected border color
}

export const COMPONENT_INFO: Record<ComponentType, ComponentInfo> = {
  light: {
    icon: Lightbulb,
    label: 'Light',
    description: 'Ceiling light fixture',
    bgColor: '#fef3c7', // yellow-100
    iconColor: '#ca8a04', // yellow-600
    selectedBgColor: '#fef3c7', // yellow-100
    selectedBorderColor: '#fde68a', // yellow-200
  },
  supply: {
    icon: Wind,
    label: 'Air Supply',
    description: 'Air supply vent',
    bgColor: '#dcfce7', // green-100
    iconColor: '#16a34a', // green-600
    selectedBgColor: '#dcfce7', // green-100
    selectedBorderColor: '#bbf7d0', // green-200
  },
  return: {
    icon: Fan,
    label: 'Air Return',
    description: 'Air return vent',
    bgColor: '#dbeafe', // blue-100
    iconColor: '#2563eb', // blue-600
    selectedBgColor: '#dbeafe', // blue-100
    selectedBorderColor: '#bfdbfe', // blue-200
  },
  smoke: {
    icon: AlarmSmoke,
    label: 'Smoke Detector',
    description: 'Smoke detector',
    bgColor: '#e9d5ff', // purple-100
    iconColor: '#9333ea', // purple-600
    selectedBgColor: '#e9d5ff', // purple-100
    selectedBorderColor: '#d8b4fe', // purple-200
  },
  invalid: {
    icon: CircleSlash2,
    label: 'Invalid',
    description: 'Invalid grid marker',
    bgColor: '#f3f4f6', // gray-100
    iconColor: '#4b5563', // gray-600
    selectedBgColor: '#f3f4f6', // gray-100
    selectedBorderColor: '#e5e7eb', // gray-200
  },
};

/**
 * Generates a unique ID for a component
 */
export function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
