import { DeviceEvent, Measurement } from '@common/domain/core'
import { KafkaMessage } from 'kafkajs'
import KafkaConsumer from '@common/infrastructure/events/KafkaConsumer.js'
import { KafkaOptions } from '@common/infrastructure/events/KafkaOptions'
import { MeasurementPresenter } from '@presentation/MeasurementPresenter.js'
import RequestHelper, { deviceHost, devicePort } from '@utils/RequestHelper.js'
import { DevicePresenter } from '@presentation/DevicePresenter.js'

export class KafkaMonitoringEventsHub {
  private readonly measurementsConsumer: KafkaConsumer
  private readonly deviceConsumer: KafkaConsumer

  constructor(kafkaOptions: KafkaOptions) {
    const measurementsOptions = { ...kafkaOptions, groupId: 'monitoring-measurements' }
    const deviceOptions = { ...kafkaOptions, groupId: 'monitoring-devices' }
    this.measurementsConsumer = new KafkaConsumer(measurementsOptions)
    this.deviceConsumer = new KafkaConsumer(deviceOptions)
  }

  private async getTopics(): Promise<string[]> {
    return await RequestHelper.get(`http://${deviceHost}:${devicePort}/devices?capabilities=sensor`)
      .then((res: any): string[] =>
        res.data
          .filter((device: any) => device.isEnabled)
          .map((device: any): string => `measurements.${device.deviceId.value}`)
      )
      .catch((_e: any): string[] => {
        throw new Error('Error getting topics from device service')
      })
  }

  subscribeToMeasurements(handler: (_measurement: Measurement) => void): void {
    this.getTopics()
      .then((topics: string[]): void => {
        this.measurementsConsumer
          .startConsuming(topics, false, (message: KafkaMessage): void => {
            if (message.value) {
              try {
                const messageValue = JSON.parse(message.value?.toString())
                messageValue.timestamp = new Date(messageValue.timestamp)
                const measurement: Measurement = MeasurementPresenter.asDomainEvent(messageValue)
                handler(measurement)
              } catch (e) {
                console.log(
                  'Error parsing measurement, message ignored because is not compliant to the schema'
                )
                console.log(e)
              }
            }
          })
          .then((): void => console.log('Measurements consumer started'))
      })
      .catch((_e: any): void => {
        console.log('Error getting measurements topics, retrying in 10 seconds')
        setTimeout((): void => this.subscribeToMeasurements(handler), 10000)
      })
  }

  addMeasurementTopics(topics: string[]): void {
    this.measurementsConsumer.addTopics(topics)
  }

  removeMeasurementTopics(topics: string[]): void {
    this.measurementsConsumer.removeTopics(topics)
  }

  subscribeToDevices(handler: (event: DeviceEvent) => void): void {
    this.deviceConsumer
      .startConsuming(['devices'], false, (message: KafkaMessage): void => {
        if (message.value) {
          try {
            const messageValue = JSON.parse(message.value?.toString())
            messageValue.timestamp = new Date(messageValue.timestamp)
            const event: DeviceEvent = DevicePresenter.asDomainEvent(messageValue)
            handler(event)
          } catch (e) {
            console.log(e)
            console.log('Error parsing device event, message ignored because is not compliant to the schema')
          }
        }
      })
      .then((): void => {
        console.log('Devices event consumer started')
      })
  }
}
