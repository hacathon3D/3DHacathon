import { Schema, Document, model, Types } from 'mongoose';
import { UserDocument } from './UserModel';

// Интерфейс для объекта ts (название и описание компонента)
export interface Ts {
  name_of_component: string;
  description_of_component: string;
  object_model: string;
  status: string;
  error: string | null;
}

// Интерфейс для промптов
export interface PromptDocument extends Document {
  user: Types.ObjectId | UserDocument;
  promptText: string;
  s3Urls: string[];  // Массив URL-ов на 3D модели
  textResponce: string;  // Текст ответа на промпт
  ts: Ts[];  // Массив объектов Ts
  createdAt: Date;
}

// Схема для объекта ts
export const TsSchema = new Schema<Ts>({
  name_of_component: { type: String, required: true },
  description_of_component: { type: String, required: true },
  object_model: { type: String, required: true },
  status: { type: String, required: true },
  error: { type: String, default: null },
});

// Схема для промптов
const PromptSchema = new Schema<PromptDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  promptText: { type: String, required: true },
  s3Urls: { type: [String], required: true },  // Список URL-ов на 3D модели
  textResponce: { type: String, required: true },  // Описание объекта
  ts: { type: [TsSchema], required: true },  // Массив объектов TsSchema
  createdAt: { type: Date, default: Date.now },
});

// Экспорт модели промптов
export const PromptModel = model<PromptDocument>('Prompt', PromptSchema);
