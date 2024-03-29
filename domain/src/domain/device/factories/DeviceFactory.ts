import { Sensor } from '../core/Sensor.js'
import { Camera } from '../core/Camera.js'
import { DeviceId } from '../core/DeviceId.js'
import { Resolution } from '../core/Resolution.js'
import { Measure } from '../core/impl/enum/Measure.js'

export interface DeviceFactory {
  createCamera(deviceId: DeviceId, isCapturing: boolean, ipAddress: string, resolution: Resolution): Camera

  createSensor(
    deviceId: DeviceId,
    isCapturing: boolean,
    ipAddress: string,
    intervalMillis: number,
    measures: Measure[]
  ): Sensor
}
