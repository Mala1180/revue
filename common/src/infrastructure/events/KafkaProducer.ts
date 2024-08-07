import { Kafka, Partitioners, Producer } from 'kafkajs'
import { getLogLevel, KafkaOptions } from './KafkaOptions.js'

export default class KafkaProducer {
  private readonly producer: Producer
  private readonly kafkaOptions: KafkaOptions
  private producerStarted: boolean

  constructor(kafkaOptions: KafkaOptions) {
    this.kafkaOptions = kafkaOptions
    this.producer = this.createProducer()
    this.producerStarted = false
  }

  private async start(): Promise<void> {
    try {
      await this.producer.connect()
      this.producerStarted = true
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect()
    this.producerStarted = false
  }

  public produce(topic: string, message: object): void {
    const sendMessage = async () => {
      this.producer
        .send({
          topic: topic,
          messages: [{ value: JSON.stringify(message) }]
        })
        .then(() => {
          console.log('Message sent to topic: ', topic)
        })
    }
    try {
      if (!this.producerStarted) {
        this.start().then(_r => sendMessage())
      } else {
        sendMessage()
      }
    } catch (error) {
      console.log('Error producing message: ', error)
    }
  }

  private createProducer(): Producer {
    const kafka: Kafka = new Kafka({
      clientId: this.kafkaOptions.clientId,
      brokers: this.kafkaOptions.brokers.map(broker => `${broker.host}:${broker.port}`),
      logLevel: getLogLevel()
    })
    return kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
  }
}
