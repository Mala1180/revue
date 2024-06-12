import mongoose, { Model } from 'mongoose'
import { Exceeding } from '../../domain/alarm-system/core/Exceeding.js'
import { Anomaly } from '../../domain/alarm-system/core/Anomaly.js'
import { Intrusion } from '../../domain/alarm-system/core/Intrusion.js'
import { AnomalyRepository } from '../../domain/alarm-system/repositories/AnomalyRepository.js'
import { IntrusionImpl } from '../../domain/alarm-system/core/impl/IntrusionImpl.js'
import { ObjectClassConverter } from '../../utils/ObjectClassConverter.js'
import { MeasureConverter } from '../../utils/MeasureConverter.js'
import { AnomalyType } from '../../domain/alarm-system/core/impl/enum/AnomalyType.js'
import { DeviceTypeConverter } from '../../utils/DeviceTypeConverter.js'

export class AnomalyRepositoryImpl implements AnomalyRepository {
  exceedingModel: Model<Exceeding>
  intrusionModel: Model<Intrusion>

  constructor(exceedingModel: Model<Exceeding>, intrusionModel: Model<Intrusion>) {
    this.exceedingModel = exceedingModel
    this.intrusionModel = intrusionModel
  }

  async getExceedings(): Promise<Exceeding[]> {
    return this.exceedingModel
      .find({
        'deviceId.type': 'SENSOR'
      })
      .orFail()
  }

  async getIntrusions(): Promise<Intrusion[]> {
    return this.intrusionModel
      .find({
        'deviceId.type': 'CAMERA'
      })
      .orFail()
  }

  async getAnomalyById(anomalyId: string): Promise<Anomaly> {
    const exceeding = await this.exceedingModel.findById(anomalyId)
    if (exceeding) {
      return exceeding
    }
    const intrusion = await this.intrusionModel.findById(anomalyId)
    if (intrusion) {
      return intrusion
    }
    throw new Error('Anomaly not found')
  }

  async insertExceeding(exceeding: Exceeding): Promise<string> {
    return await this.exceedingModel
      .create({
        deviceId: {
          type: DeviceTypeConverter.convertToString(exceeding.deviceId.type),
          code: exceeding.deviceId.code
        },
        timestamp: exceeding.timestamp,
        value: exceeding.value,
        measure: MeasureConverter.convertToString(exceeding.measure)
      })
      .then((exceeding): string => {
        return exceeding._id.toString()
      })
      .catch((err): string => {
        throw err
      })
  }

  async insertIntrusion(intrusion: Intrusion): Promise<string> {
    return await this.intrusionModel
      .create({
        deviceId: {
          type: DeviceTypeConverter.convertToString(intrusion.deviceId.type),
          code: intrusion.deviceId.code
        },
        timestamp: intrusion.timestamp,
        intrusionObject: ObjectClassConverter.convertToString((intrusion as IntrusionImpl).intrusionObject)
      })
      .then((intrusion): string => {
        return intrusion._id.toString()
      })
      .catch((err): string => {
        throw err
      })
  }

  async updateExceeding(exceeding: Exceeding): Promise<void> {
    await this.exceedingModel
      .findByIdAndUpdate(exceeding.anomalyId, {
        deviceId: {
          type: DeviceTypeConverter.convertToString(exceeding.deviceId.type),
          code: exceeding.deviceId.code
        },
        timestamp: exceeding.timestamp,
        value: exceeding.value,
        measure: MeasureConverter.convertToString(exceeding.measure)
      })
      .catch((err): void => {
        throw err
      })
  }

  async updateIntrusion(intrusion: Intrusion): Promise<void> {
    await this.intrusionModel
      .findByIdAndUpdate(intrusion.anomalyId, {
        deviceId: {
          type: DeviceTypeConverter.convertToString(intrusion.deviceId.type),
          code: intrusion.deviceId.code
        },
        timestamp: intrusion.timestamp,
        intrusionObject: ObjectClassConverter.convertToString(intrusion.intrusionObject)
      })
      .catch((err): void => {
        throw err
      })
  }

  async deleteAnomaly(anomalyId: string, type: AnomalyType): Promise<void> {
    switch (type) {
      case AnomalyType.EXCEEDING:
        await this.exceedingModel.deleteOne({ _id: new mongoose.Types.ObjectId(anomalyId) })
        break
      case AnomalyType.INTRUSION:
        await this.intrusionModel.deleteOne({ _id: new mongoose.Types.ObjectId(anomalyId) })
        break
    }
  }
}
