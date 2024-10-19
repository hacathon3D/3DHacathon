import { Schema, Document, model, Types } from 'mongoose';
import { ComponentDocument } from './ComponentModel';

export interface DimaDocument extends Document {
  s3Urls: string[];
  textResponce: string;
  components: Types.Array<Types.ObjectId | ComponentDocument>;
}

const DimaSchema = new Schema<DimaDocument>({
  s3Urls: { type: [String], required: true },
  textResponce: { type: String, required: true },
  components: [{ type: Schema.Types.ObjectId, ref: 'Component' }],
});

export const DimaModel = model<DimaDocument>('Dima', DimaSchema);
