import { Response } from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { connectToMock, disconnectFromMock } from '../storage/MongoDBMock.js'
import HttpStatusCode from '@utils/HttpStatusCode.js'

const TOKEN = process.env.DEV_API_KEY

describe('PUT /devices', (): void => {
  beforeAll(async (): Promise<void> => {
    await connectToMock()
  })
  describe('PUT /devices', (): void => {
    it('responds with a forbidden status if no auth token is provided', async (): Promise<void> => {
      // @ts-ignore
      const update: Response = await deviceService.put('/devices')
      expect(update.status).toBe(HttpStatusCode.FORBIDDEN)
    })

    it('should update the device', async (): Promise<void> => {
      const newDevice = {
        endpoint: {
          ipAddress: '192.168.1.1',
          port: 1000
        },
        description: 'updated description',
        locationId: 'updated locationId',
        isEnabled: false
      }

      // @ts-ignore
      const update: Response = await deviceService
        .put('/devices/test-device-id')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(newDevice)

      expect(update.status).toBe(HttpStatusCode.OK)
      expect(update.type).toBe('application/json')
    })
  })

  afterAll(async (): Promise<void> => {
    await disconnectFromMock()
  })
})
