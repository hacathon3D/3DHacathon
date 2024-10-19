import { Schema, Document, model, Types } from 'mongoose';
import { UserDocument } from './UserModel';
import { MessageDocument } from './MessageModel';

export interface ChatDocument extends Document {
  user: Types.ObjectId | UserDocument;
  imageUrl: string;
  messages: Types.Array<Types.ObjectId | MessageDocument>;
  createdAt: Date;
}

const ChatSchema = new Schema<ChatDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: { type: Date, default: Date.now },
});

export const ChatModel = model<ChatDocument>('Chat', ChatSchema);
