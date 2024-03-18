import { SecurityRule } from '../../domain/alarm-system/core/SecurityRule.js'
import { ExceedingRule } from '../../domain/alarm-system/core/ExceedingRule.js'
import { IntrusionRule } from '../../domain/alarm-system/core/IntrusionRule.js'
import { EnvironmentData } from '../../domain/device/core/EnvironmentData.js'
import { ObjectClass } from '../../domain/alarm-system/core/impl/enum/ObjectClass.js'
import { DeviceId } from '../../domain/device/core/DeviceId.js'

export interface SecurityRuleService {
  getSecurityRuleById(id: string): Promise<SecurityRule>

  getExceedingRules(): Promise<ExceedingRule[]>

  getIntrusionRules(): Promise<IntrusionRule[]>

  insertExceedingSecurityRule(exceedingRule: ExceedingRule): void

  insertIntrusionSecurityRule(intrusionRule: IntrusionRule): void

  updateExceedingSecurityRule(exceedingRule: ExceedingRule): void

  updateIntrusionSecurityRule(intrusionRule: IntrusionRule): void

  deleteExceedingRule(id: string): void

  deleteIntrusionRule(id: string): void

  checkExceedingDetection(environmentData: EnvironmentData): boolean

  checkIntrusionDetection(cameraId: DeviceId, objectClass: ObjectClass, timestamp: Date): boolean
}
