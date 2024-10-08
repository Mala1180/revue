<script setup lang="ts">
import type { Device } from '@/domain/core/Device'
import RequestHelper, { deviceHost } from '@/utils/RequestHelper'
import { type Capability, CapabilityType } from '@/domain/core/Capability'
import { ref } from 'vue'
import { MeasureType } from 'common/dist/domain/core'
import { popNegative, popPositive } from '@/scripts/Popups'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const { device } = defineProps<{
  device: Device
}>()

const emit = defineEmits(['get-devices'])

const resetFields = () => {
  description.value = ''
  ip.value = ''
  port.value = 0
  locationId.value = ''
  capabilities.value = []
}

const description = ref<string>(device.description)
const ip = ref<string>(device.endpoint.ipAddress)
const port = ref<number>(device.endpoint.port)
const locationId = ref<string>(device.locationId)
const capabilities = ref<Capability[]>([])

const retrieveThingInfos = () => {
  RequestHelper.get(`${deviceHost}/devices/${ip.value}:${port.value}/status`)
    .then(async (res: any) => {
      locationId.value = res.data.locationId
      for (let i = 0; i < res.data.capabilities.length; i++) {
        const capability = res.data.capabilities[i]
        if (capability.type === CapabilityType.SENSOR) {
          capabilities.value.push({
            type: CapabilityType.SENSOR,
            capturingInterval: capability.capturingInterval,
            measure: {
              type: capability.measure.type as MeasureType,
              unit: capability.measure.unit
            }
          })
        } else if (capability.type === CapabilityType.VIDEO) {
          capabilities.value.push({
            type: CapabilityType.VIDEO,
            resolution: capability.resolution
          })
        }
      }
    })
    .catch(_error => {
      popNegative($q, 'Error while retrieving device info')
    })
}

const updateDevice = () => {
  if (!ip.value || !port.value || !locationId.value) {
    popNegative($q, 'Please fill all fields')
    return
  }
  try {
    capabilities.value = []
    retrieveThingInfos()
  } catch (error) {
    console.log('Error while retrieving thing infos')
  }

  RequestHelper.put(`${deviceHost}/devices/${device.deviceId}`, {
    description: description.value,
    endpoint: {
      ipAddress: ip.value,
      port: port.value
    },
    locationId: locationId.value,
    isEnabled: device.isEnabled
  })
    .then(async (_res: any) => {
      popPositive($q, 'Device updated successfully')
      emit('get-devices')
    })
    .catch(_error => {
      console.log('Error while updating device')
    })
  resetFields()
}
</script>

<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <h3 class="text-h5">Update device</h3>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <label>IP Address</label>
        <q-input dense v-model="ip" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <label>Port</label>
        <q-input dense v-model="port" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <label>Location</label>
        <q-input disable dense v-model="locationId" autofocus />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <label>Description</label>
        <q-input dense v-model="description" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup class="text-primary" />
        <q-btn flat label="OK" v-close-popup class="bg-white text-teal" @click="updateDevice" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
div.resolution {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 15px;

  input {
    height: 50px !important;
  }
}
</style>
