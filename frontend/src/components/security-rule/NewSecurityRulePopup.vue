<script setup lang="ts">
import { Measure } from 'domain/dist/domain/device/core/impl/enum/Measure'
import { onMounted, ref, toRaw } from 'vue'
import type { DeviceIdFactory } from '@domain/device/factories'
import { DeviceIdFactoryImpl } from '@domain/device/factories'
import {
  AnomalyType,
  type ExceedingRule,
  type IntrusionRule,
  ObjectClass
} from 'domain/dist/domain/alarm-system/core'
import { type SecurityRuleFactory, SecurityRuleFactoryImpl } from 'domain/dist/domain/alarm-system/factories'
import type { Contact } from 'domain/dist/domain/monitoring/core'
import { MeasureConverter, ObjectClassConverter } from 'domain/dist/utils'
import RequestHelper, { authHost, authPort, monitoringHost, monitoringPort } from '@/utils/RequestHelper'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  (_e: 'insert-exceeding-rule', _exceedingRule: ExceedingRule): void
  (_e: 'insert-intrusion-rule', _intrusionRule: IntrusionRule): void
}>()

const deviceIdFactory: DeviceIdFactory = new DeviceIdFactoryImpl()
const securityRuleFactory: SecurityRuleFactory = new SecurityRuleFactoryImpl()

const resetFields = () => {
  anomalyType.value = AnomalyType.EXCEEDING
  min.value = undefined
  max.value = undefined
  code.value = undefined
  contacts.value = []
  description.value = undefined
  from.value = undefined
  to.value = undefined
  measure.value = Measure.TEMPERATURE
  objectClass.value = ObjectClass.PERSON
}

const anomalyType = ref<AnomalyType>(AnomalyType.EXCEEDING)
const min = ref<number>()
const max = ref<number>()
const code = ref<string>()
const contacts: ref<Contact[]> = ref([])
const description = ref<string>()
const from = ref<string>()
const to = ref<string>()
const measure = ref<Measure>(Measure.TEMPERATURE)
const objectClass = ref<ObjectClass>(ObjectClass.PERSON)

const optionsObjectClass = ref(
  Object.keys(ObjectClass)
    .filter(key => isNaN(Number(key)))
    .filter(
      key =>
        Array.of(ObjectClass.PERSON, ObjectClass.CAR, ObjectClass.TRUCK, ObjectClass.BOAT).indexOf(
          ObjectClassConverter.convertToObjectClass(key)
        ) >= 0
    )
    .map(value => {
      return {
        label: value,
        value: ObjectClassConverter.convertToObjectClass(value)
      }
    })
)

const optionsMeasure = ref(
  Object.keys(Measure)
    .filter(key => isNaN(Number(key)))
    .map(value => {
      return {
        label: value,
        value: MeasureConverter.convertToMeasure(value)
      }
    })
)

const optionsCameraCodes: ref<{ label: string; value: string }> = ref([])
const getCameraCodes = async () => {
  await RequestHelper.get(`http://${monitoringHost}:${monitoringPort}/devices/cameras`)
    .then((res: any) => {
      optionsCameraCodes.value = []
      for (let i = 0; i < res.data.length; i++) {
        optionsCameraCodes.value.push({
          label: res.data[i]._id.code,
          value: res.data[i]._id.code
        })
      }
    })
    .catch(error => {
      console.log(error)
    })
}

const optionsSensorCodes: ref<{ label: string; value: string }> = ref([])
const getSensorCodes = async () => {
  await RequestHelper.get(`http://${monitoringHost}:${monitoringPort}/devices/sensors`)
    .then((res: any) => {
      optionsSensorCodes.value = []
      for (let i = 0; i < res.data.length; i++) {
        optionsSensorCodes.value.push({
          label: res.data[i]._id.code,
          value: res.data[i]._id.code
        })
      }
    })
    .catch(error => {
      console.log(error)
    })
}

const optionsContacts = ref<{ label: string; value: string }[]>([])

const getContacts = async () => {
  await RequestHelper.get(`http://${authHost}:${authPort}/users/${useUserStore().userId}`)
    .then((res: any) => {
      optionsContacts.value = []
      for (let i = 0; i < res.data.contacts.length; i++) {
        optionsContacts.value.push({
          label: res.data.contacts[i].type + ': ' + res.data.contacts[i].value,
          value: res.data.contacts[i].value
        })
      }
    })
    .catch(error => {
      console.log(error)
    })
}

const addNewSecurityRule = () => {
  if (anomalyType.value == AnomalyType.EXCEEDING) {
    const newExceedingRule: ExceedingRule = securityRuleFactory.createExceedingRule(
      min.value!,
      max.value!,
      measure.value,
      '',
      deviceIdFactory.createSensorId(toRaw(code.value!).value),
      useUserStore().userId,
      toRaw(contacts.value).map((c: Contact) => {
        return {
          type: toRaw(c).label.split(':')[0],
          value: toRaw(c).value
        }
      }),
      description.value!,
      new Date('1970-01-01T' + from.value!.slice(0, 5) + ':00.000Z'), //from.value.includes(' ') ? from.value.split(' ')[0] :
      new Date('2030-01-01T' + to.value!.slice(0, 5) + ':00.000Z') //to.value.includes(' ') ? to.value.split(' ')[0] :
    )
    emit('insert-exceeding-rule', newExceedingRule)
  } else if (anomalyType.value == AnomalyType.INTRUSION) {
    const newIntrusionRule: IntrusionRule = securityRuleFactory.createIntrusionRule(
      objectClass.value,
      '',
      deviceIdFactory.createCameraId(toRaw(code.value!).value),
      useUserStore().userId,
      toRaw(contacts.value).map((c: { label: string; value: string }) => {
        return {
          type: toRaw(c).label.split(':')[0],
          value: toRaw(c).value
        }
      }),
      description.value!,
      new Date('1970-01-01T' + from.value!.slice(0, 5) + ':00.000Z'), // from.value.includes(' ') ? from.value.split(' ')[0] : ?????? .splice(0, 5)
      new Date('2030-01-01T' + to.value!.slice(0, 5) + ':00.000Z') //to.value.includes(' ') ? to.value.split(' ')[0] :
    )
    emit('insert-intrusion-rule', newIntrusionRule)
  }
  resetFields()
}

onMounted(async () => {
  await getCameraCodes()
  await getSensorCodes()
  await getContacts()
})
</script>

<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <h3 class="text-h5">Add a Security Rule</h3>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-radio dense v-model="anomalyType" :val="AnomalyType.EXCEEDING" label="Exceeding" />
        <q-radio dense v-model="anomalyType" :val="AnomalyType.INTRUSION" label="Intrusion" />
      </q-card-section>
      <div v-if="anomalyType == AnomalyType.EXCEEDING">
        <q-card-section class="q-pt-none">
          <label>Code</label>
          <q-select v-model="code" :options="optionsSensorCodes" label="Sensor code" />
        </q-card-section>
        <q-option-group
          style="display: flex; flex-direction: column"
          v-model="measure"
          :options="optionsMeasure"
          type="radio"
        />
        <q-card-section class="q-pt-none">
          <label>Min tolerated value</label>
          <q-input type="number" v-model="min" />
          <label>Max tolerated value</label>
          <q-input type="number" v-model="max" />
        </q-card-section>
      </div>
      <div v-if="anomalyType == AnomalyType.INTRUSION">
        <q-card-section class="q-pt-none">
          <label>Code</label>
          <q-select v-model="code" :options="optionsCameraCodes" label="Camera code" />
        </q-card-section>
        <q-option-group
          style="display: flex"
          v-model="objectClass"
          :options="optionsObjectClass"
          type="radio"
        />
      </div>
      <q-card-section>
        <label>Description</label>
        <q-input v-model="description" label="Rule description" />
      </q-card-section>
      <q-card-section>
        <label>Contacts</label>
        <q-select
          filled
          v-model="contacts"
          multiple
          :options="optionsContacts"
          counter
          hint="Contacts to notify"
          style="width: 250px"
        />
      </q-card-section>
      <div>
        <q-card-section class="q-pt-none">
          <label>Validation From</label>
          <q-input type="time" v-model="from" />
          <label>To</label>
          <q-input type="time" v-model="to" />
        </q-card-section>
      </div>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup class="text-primary" />
        <q-btn flat label="OK" v-close-popup class="bg-white text-teal" @click="addNewSecurityRule" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
