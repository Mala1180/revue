import { Anomaly } from '../../alarm-system/core/Anomaly.js'
import { DeviceId } from '../../device/core/DeviceId.js'

export interface RecognizingNode {
  get recognizingNodeId(): string

  set recognizingNodeId(recognizingNodeId: string)

  get ipAddress(): string

  set ipAddress(ipAddress: string)

  get deviceIds(): DeviceId[]

  set deviceIds(deviceIds: DeviceId[])

  anomalyDetected(): Anomaly
}
