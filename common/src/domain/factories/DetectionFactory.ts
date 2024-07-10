import { DomainEventId } from '../core/DomainEventId.js'
import { Detection } from '../core/Detection.js'
import { ObjectClass } from '../core/ObjectClass.js'

export class DetectionFactory {
  static newId(): DomainEventId {
    return {
      value: 'test'
    }
  }

  static idOf(value: string): DomainEventId {
    return { value }
  }

  static detectionFrom(
    id: DomainEventId,
    timestamp: Date,
    sourceDeviceId: string,
    objectClass: ObjectClass
  ): Detection {
    return {
      id,
      type: 'detection',
      timestamp,
      sourceDeviceId,
      objectClass
    }
  }

  static createDetection(timestamp: Date, sourceDeviceId: string, objectClass: ObjectClass): Detection {
    return this.detectionFrom(this.newId(), timestamp, sourceDeviceId, objectClass)
  }
}