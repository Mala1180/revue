import type { Express, NextFunction, Request, Response } from 'express'
import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import { mongoConnect } from '@utils/connection.js'
import { notificationRouter } from '@/infrastructure/api/routes/notification.js'
import cors from 'cors'
import { Server as SocketIOServer } from 'socket.io'
import http, { Server as HttpServer } from 'http'
import { jwtManager } from '@utils/JWTManager.js'
import { getBrokersFromEnv, KafkaBroker, KafkaOptions } from '@common/infrastructure/events/KafkaOptions.js'
import { KafkaNotificationEventsHub } from '@/infrastructure/events/kafka/KafkaNotificationEventsHub.js'
import { SocketNotificationEventsHub } from '@/infrastructure/events/socket/SocketNotificationEventsHub.js'
import { NotificationEventsHub } from '@/application/services/NotificationEventsHub'
import { NotificationServiceImpl } from '@/application/services/impl/NotificationServiceImpl.js'
import { NotificationEventsHubImpl } from '@/infrastructure/events/NotificationEventsHubImpl.js'
import { NotificationService } from '@/application/services/NotificationService'
import { MongoDBNotificationRepository } from '@/infrastructure/storage/MongoDBNotificationRepository.js'
import { MailService } from '@/application/services/MailService'
import { MailServiceImpl } from '@/application/services/impl/MailServiceImpl.js'

config({ path: process.cwd() + '/../.env' })

export const app: Express = express()
app.use(express.json())
app.use(cors())

const PORT: number = Number(process.env.NOTIFICATION_PORT)

const server: HttpServer = http.createServer(app)

const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: '*'
  }
})

app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token: string = (authHeader && authHeader.split(' ')[1]) || ''
  if (token === process.env.DEV_API_KEY) return next()
  if (token === undefined || token === '') return res.status(403).send({ error: 'No authentication token' })
  else {
    console.log('Authentication token: ' + token)
    jwtManager.authenticate(req, res, next)
  }
})
app.use('/notifications', notificationRouter)

const brokers: KafkaBroker[] = getBrokersFromEnv()

const kafkaOptions: KafkaOptions = {
  clientId: 'notification',
  brokers: brokers,
  groupId: 'notificationConsumer'
}

const kafkaNotification: KafkaNotificationEventsHub = new KafkaNotificationEventsHub(kafkaOptions)
const socketNotification: SocketNotificationEventsHub = new SocketNotificationEventsHub(io)
const mailService: MailService = new MailServiceImpl()

const notificationEventsHub: NotificationEventsHub = new NotificationEventsHubImpl(
  kafkaNotification,
  socketNotification
)
export const notificationService: NotificationService = new NotificationServiceImpl(
  new MongoDBNotificationRepository(),
  notificationEventsHub,
  mailService
)

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async (): Promise<void> => {
    console.log(`Notification server listening on port ${PORT}`)
    await mongoConnect(mongoose, 'notification')
  })
}
