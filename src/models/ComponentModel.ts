import { Schema, Document, model } from 'mongoose';

export interface ComponentDocument extends Document {
  name_of_component: string;
  description_of_component: string;
  object_model: string; // URL на 3D-модель
  status: string;
  error: string | null;
}

const ComponentSchema = new Schema<ComponentDocument>({
  name_of_component: { type: String, required: true },
  description_of_component: { type: String, required: true },
  object_model: { type: String, required: true },
  status: { type: String, required: true },
  error: { type: String, default: null },
});

export const ComponentModel = model<ComponentDocument>('Component', ComponentSchema);
