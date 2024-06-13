import { Schema } from 'mongoose'

export const numericMeasurementSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  sourceDeviceId: {
    type: String,
    required: true
  },
  measureType: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})