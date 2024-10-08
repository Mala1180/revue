import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { deviceSample, deviceSample1 } from '../resources/deviceSample.js'
import { DeviceDBEntity } from '@/infrastructure/storage/models/DeviceModel'
import { deviceSchema } from '@/infrastructure/storage/schemas/DeviceSchema'

let mongoMock: any = null

export const connectToMock = async (): Promise<void> => {
  mongoMock = await MongoMemoryServer.create()
  await mongoose.connect(mongoMock.getUri(), {
    directConnection: true
  })
}

export const disconnectFromMock = async (): Promise<void> => {
  await mongoose.connection.close()
  if (mongoMock) {
    await mongoMock.stop()
  }
}

export const populateDevices = async (): Promise<void> => {
  const _model = mongoose.model<DeviceDBEntity>('Device', deviceSchema, 'device')
  await _model.create(deviceSample)
  await _model.create(deviceSample1)
}
