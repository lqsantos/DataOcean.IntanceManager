import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cria um ID aleatório único
 * @returns string Um ID aleatório no formato 'xxxx-xxxx-xxxx' onde x é um caractere alfanumérico
 */
export function createRandomId(): string {
  return Array.from({ length: 3 }, () => Math.random().toString(36).substring(2, 6)).join('-');
}
