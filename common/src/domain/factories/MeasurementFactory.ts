import { NumericMeasurement } from "../core/NumericMeasurment";
import { DomainEventId } from "../core/DomainEventId";
import { MeasureType } from "../core/MeasureType";

export class MeasurementFactory {

  static idOf(id: string): DomainEventId {
    return {
      id
    };
  }

  static createNumericMeasurement(id: DomainEventId, timestamp: Date, sourceDeviceId: string, measureType: MeasureType, value: number): NumericMeasurement {
    return {
      id,
      timestamp,
      sourceDeviceId,
      measureType,
      value
    };
  }

}