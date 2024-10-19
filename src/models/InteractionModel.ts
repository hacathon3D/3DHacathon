import { Schema, Document, model } from 'mongoose';

interface Message {
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface InteractionDocument extends Document {
  userIp: string;
  prompt?: string;
  photo?: Buffer | string; // Если сохраняете путь к файлу или сам файл
  s3Urls: string[];
  textResponse: string;
  selectedImageUrl?: string;
  messages: Message[];
  createdAt: Date;
}

const MessageSchema = new Schema<Message>({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const InteractionSchema = new Schema<InteractionDocument>({
  userIp: { type: String, required: true },
  prompt: { type: String },
  photo: { type: Buffer }, // Или используйте String для пути к файлу
  s3Urls: { type: [String], required: true },
  textResponse: { type: String, required: true },
  selectedImageUrl: { type: String },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export const InteractionModel = model<InteractionDocument>('Interaction', InteractionSchema);
