<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, type Ref, ref } from 'vue'
import { DeviceType, type EnvironmentData, type Sensor } from '@domain/device/core'
import type { DeviceIdFactory } from '@domain/device/factories'
import { DeviceIdFactoryImpl, EnvironmentDataFactoryImpl } from '@domain/device/factories'
import SensorData from '@/components/devices/SensorData.vue'
import RequestHelper, { monitoringHost, monitoringPort } from '@/utils/RequestHelper'
import { monitoringSocket, notificationSocket, setupSocketServers } from '@/socket'
import { useQuasar } from 'quasar'
import router from '@/router'
import { AnomalyTypeConverter, DeviceTypeConverter } from 'domain/dist/utils'
import { AnomalyType } from 'domain/dist/domain/alarm-system/core'
import { useTopicsStore } from '@/stores/topics'
import { useUserStore } from '@/stores/user'
import { type AxiosResponse, HttpStatusCode } from 'axios'
import { composeSensor } from '@/scripts/presentation/device/ComposeDevice'

const topicsStore = useTopicsStore()
const userStore = useUserStore()
const $q = useQuasar()
const deviceIdFactory: DeviceIdFactory = new DeviceIdFactoryImpl()
const environmentDataFactory = new EnvironmentDataFactoryImpl()

const sensors: Ref<{ sensor: Sensor; lastData: EnvironmentData[] }[]> = ref([])

if (monitoringSocket == undefined || notificationSocket == undefined) {
  setupSocketServers(userStore.accessToken)
}

RequestHelper.get(`http://${monitoringHost}:${monitoringPort}/devices/sensors`).then(
  async (res: AxiosResponse) => {
    if (res.status == HttpStatusCode.Ok) {
      for (let i = 0; i < res.data.length; i++) {
        if (res.data[i].isCapturing) {
          const sensor = composeSensor(res.data[i])
          sensors.value.push({ sensor: sensor, lastData: [] })
        }
      }
    }
  }
)

onBeforeMount(() => {
  monitoringSocket?.emit(
    'resume',
    topicsStore.subscribedTopics.filter((topic: string) =>
      topic.startsWith(DeviceTypeConverter.convertToString(DeviceType.SENSOR))
    )
  )
})

onBeforeUnmount(() => {
  monitoringSocket?.emit(
    'pause',
    topicsStore.subscribedTopics.filter((topic: string) =>
      topic.startsWith(DeviceTypeConverter.convertToString(DeviceType.SENSOR))
    )
  )
})

monitoringSocket?.on('env-data', (data: { topic: string; data: string }) => {
  const rawValues = JSON.parse(data.data)
  const newValues: EnvironmentData[] = []
  for (const rawValue of rawValues) {
    const envData = environmentDataFactory.createEnvironmentData(
      deviceIdFactory.createSensorId(rawValue._sourceDeviceId._code),
      rawValue._value,
      rawValue._measure,
      rawValue._measureUnit,
      new Date(rawValue._timestamp)
    )
    newValues.push(envData)
  }
  sensors.value.find(sensor => sensor.sensor.deviceId.code === newValues[0].sourceDeviceId.code)!.lastData =
    newValues
})

if (notificationSocket?.listeners('notification').length === 0) {
  notificationSocket?.on('notification', (anomaly: { type: string }) => {
    switch (AnomalyTypeConverter.convertToAnomalyType(anomaly.type)) {
      case AnomalyType.EXCEEDING:
        showNotification('Exceeding notification')
        break
      case AnomalyType.INTRUSION:
        showNotification('Intrusion notification')
        break
      default:
        break
    }
  })
}

const showNotification = (message: string) => {
  $q.notify({
    message: message,
    color: 'primary',
    icon: 'mark_unread_chat_alt',
    actions: [
      {
        label: 'Dismiss',
        color: 'white',
        handler: () => {}
      },
      {
        label: 'Read',
        color: 'white',
        handler: () => {
          router.push('/notifications')
        }
      }
    ]
  })
}
</script>
<template>
  <h2>Environment data</h2>
  <div>
    <sensor-data
      v-for="(item, index) in sensors.filter(elem => elem.sensor.isCapturing)"
      :key="index"
      :sensor="item.sensor"
      :last-data="item.lastData"
    />
  </div>
</template>

<style scoped lang="scss"></style>
