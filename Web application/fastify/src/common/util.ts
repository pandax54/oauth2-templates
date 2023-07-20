import axios from 'axios'
import { isString, omitBy, isUndefined } from 'lodash'

export function removeUndefined<T>(obj: T) {
  return omitBy(obj, isUndefined)
}

/**
 * returns input || null
 */
export function orNull<T>(value: T): T | null {
  return value || null
}

/**
 * Builds a full name string
 */
export function getFullName(firstName: string, ...names: string[]): string {
  if (!firstName) return null

  return [firstName, ...names.filter(isString).map((n) => n.trim())].join(' ').trim()
}

/**
 * Changes phone number to E.164 format
 */
export function formatPhone(phone: string) {
  const formattedPhone = '+1'.concat(phone.replace(/[()-\s]/g, ''))
  return formattedPhone
}

export async function urlToBase64(url: string) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const base64String = Buffer.from(response.data, 'binary').toString('base64')

  return base64String
}

