import { Schema, Document, model, Types } from 'mongoose';
import { ChatDocument } from './ChatModel';

export interface MessageDocument extends Document {
  chat: Types.ObjectId | ChatDocument;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<MessageDocument>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const MessageModel = model<MessageDocument>('Message', MessageSchema);
