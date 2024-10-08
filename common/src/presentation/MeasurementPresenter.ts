import { Measurement } from '../domain/core'
import { measurementSchema } from './schemas/MeasurementSchema.js'

export class MeasurementPresenter {
  static asDomainEvent(measurementObj: object): Measurement {
    return measurementSchema.parse(measurementObj)
  }

  static asMessage(measurement: Measurement): object {
    return { ...measurement }
  }
}
