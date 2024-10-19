import { Schema, Document, model, Types } from 'mongoose';
import { DimaDocument } from './DIimash';

export interface DeviceDataDocument extends Document {
  deviceId: string;
  dimaRef: Types.ObjectId | DimaDocument;
}

const DeviceDataSchema = new Schema<DeviceDataDocument>({
  deviceId: { type: String, required: true },
  dimaRef: { type: Schema.Types.ObjectId, ref: 'Dima', required: true },
});

export const DeviceDataModel = model<DeviceDataDocument>('DeviceData', DeviceDataSchema);
