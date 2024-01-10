import { Measure } from '../domain/device/core/impl/enum/Measure.js'

export class MeasureConverter {
  static convertToMeasure(measure: String): Measure {
    switch (measure.toLowerCase()) {
      case 'TEMPERATURE':
        return Measure.TEMPERATURE
      case 'HUMIDITY':
        return Measure.HUMIDITY
      case 'PRESSURE':
        return Measure.PRESSURE
      default:
        throw new Error('Measure not found')
    }
  }

  static convertToString(measure: Measure): String {
    switch (measure) {
      case Measure.TEMPERATURE:
        return 'TEMPERATURE'
      case Measure.HUMIDITY:
        return 'HUMIDITY'
      case Measure.PRESSURE:
        return 'PRESSURE'
      default:
        throw new Error('Measure not found')
    }
  }
}
