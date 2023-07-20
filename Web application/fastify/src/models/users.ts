import { getFullName } from '@app/common/util'
import { Modifiers } from 'objection'
import { Base } from './base'

export class User extends Base {
  static tableName = 'users'

  id?: number

  email: string
  firstName: string
  lastName: string
  phone?: string
  password?: string
  isEmailVerified?: boolean
  ip?: string
  isRestricted?: boolean
  isPhoneVerified: boolean
  isLocked: boolean


  /**
   * Virtual Attributes
   */

  static virtualAttributes: string[] = ['fullName', 'isRestricted']


  get fullName() {
    return getFullName(this.firstName, this.lastName)
  }

  static beforeInsert({ inputItems }) {
    for (const item of inputItems) {
      if (item.email) item.email = item.email.toLowerCase().trim()
    }
  }

  static modifiers: Modifiers = {
    User(builder) {
      const columns = ['id', 'firstName', 'lastName', 'phone', 'companyName']

      builder.select(columns.map((c) => `users.${c}`))
    },
  }
}
