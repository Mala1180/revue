import express, { Request, Response, Router } from 'express'
import { measurementController } from '../controller/measurements.js'
import { EnvironmentData } from '@domain/device/core/EnvironmentData.js'
import HttpStatusCode from '@utils/HttpStatusCode.js'

export const environmentDataRouter: Router = express.Router()

environmentDataRouter.route('/').get((_req: Request, res: Response): void => {
  measurementController
    .getMeasurements()
    .then((environmentData: EnvironmentData[]): void => {
      res.status(HttpStatusCode.OK).send(environmentData)
    })
    .catch((): void => {
      res.send({ error: 'No data found' })
    })
})
