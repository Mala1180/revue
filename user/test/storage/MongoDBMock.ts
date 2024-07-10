import mongoose, { model, Model } from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server'
import { userSample } from '../resources/userSample.js'
import { userSchema } from "@/infrastructure/storage/schemas/UserSchema";
import { User } from "@/domain/core/User";

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

export const populateUsers = async (): Promise<void> => {
  const userModel: Model<User> = model<User>('User', userSchema, 'user')
  await userModel.create(userSample)
}