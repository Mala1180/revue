import type { Request } from 'express'
import { User } from '@domain/monitoring/core/User.js'
import { Contact } from '@domain/monitoring/core/Contact.js'
import { UserFactory } from '@domain/monitoring/factories/UserFactory.js'
import { UserFactoryImpl } from '@domain/monitoring/factories/impl/UserFactoryImpl.js'
import { DeviceIdFactory } from '@domain/device/factories/DeviceIdFactory.js'
import { DeviceIdFactoryImpl } from '@domain/device/factories/impl/DeviceIdFactoryImpl.js'
import { DeviceId } from '@domain/device/core/DeviceId.js'
import { DeviceTypeConverter } from '@utils/DeviceTypeConverter.js'
import { ContactFactory } from '@domain/monitoring/factories/ContactFactory.js'
import { ContactFactoryImpl } from '@domain/monitoring/factories/impl/ContactFactoryImpl.js'
import { ContactTypeConverter } from '@utils/ContactTypeConverter.js'
import { userService } from '../init.js'

const userFactory: UserFactory = new UserFactoryImpl()
const deviceIdFactory: DeviceIdFactory = new DeviceIdFactoryImpl()
const contactFactory: ContactFactory = new ContactFactoryImpl()

export const userController = {
  getUserById: async (id: string): Promise<User> => {
    return await userService.getUserById(id)
  },
  getUsers: async (): Promise<User[]> => {
    return await userService.getUsers()
  },
  createUser: async (req: Request): Promise<void> => {
    const contacts: Contact[] = req.body.contacts.map((contactObj: { value: string; type: string }) =>
      contactFactory.createContact(
        contactObj.value,
        ContactTypeConverter.convertToContactType(contactObj.type)
      )
    )
    const deviceIds: DeviceId[] = req.body.deviceIds.map((deviceIdObj: { type: string; code: string }) =>
      deviceIdFactory.createId(DeviceTypeConverter.convertToDeviceType(deviceIdObj.type), deviceIdObj.code)
    )
    const user: User = userFactory.createUser(
      req.body.id,
      req.body.name,
      req.body.surname,
      req.body.username,
      req.body.password,
      req.body.token,
      req.body.refreshToken,
      contacts,
      deviceIds
    )
    return userService.insertUser(user)
  },
  updateUser: async (req: Request): Promise<void> => {
    const user: User = userFactory.createUser(
      req.body.id,
      req.body.name,
      req.body.surname,
      req.body.mail,
      req.body.contacts
    )
    return userService.updateUser(user)
  },
  deleteUser: async (id: string): Promise<void> => {
    return userService.deleteUser(id)
  }
}
