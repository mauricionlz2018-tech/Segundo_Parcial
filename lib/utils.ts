import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un tiempo en formato de 24 horas (HH:MM) a formato de 12 horas (HH:MM AM/PM)
 * @param time - Tiempo en formato HH:MM (ej: "14:30")
 * @returns Tiempo en formato HH:MM AM/PM (ej: "2:30 PM")
 */
export function formatTime12Hour(time: string): string {
  if (!time || !time.includes(':')) return time
  
  try {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const minute = minutes
    
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    
    return `${hour12}:${minute} ${ampm}`
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
  }
}

/**
 * Convierte una fecha ISO a formato legible (ej: "16 May" o "16 May 2026")
 * @param date - Fecha en formato ISO (ej: "2026-05-16T06:00:00.000Z")
 * @param showYear - Mostrar el año (default: false)
 * @returns Fecha formateada (ej: "16 May")
 */
export function formatDate(date: string, showYear: boolean = false): string {
  if (!date) return ''
  
  try {
    const dateObj = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const day = dateObj.getUTCDate()
    const month = months[dateObj.getUTCMonth()]
    const year = dateObj.getUTCFullYear()
    
    return showYear ? `${day} ${month} ${year}` : `${day} ${month}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return date
  }
}
