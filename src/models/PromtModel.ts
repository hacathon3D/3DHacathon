import { Schema, Document, model, Types } from 'mongoose';
import { UserDocument } from './UserModel';

export interface PromptDocument extends Document {
  user: Types.ObjectId | UserDocument;
  promptText: string;
  createdAt: Date;
}

const PromptSchema = new Schema<PromptDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  promptText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PromptModel = model<PromptDocument>('Prompt', PromptSchema);
