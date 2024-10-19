import { Schema, Document, model, Types } from 'mongoose';
import { ChatDocument } from './ChatModel';
import { PromptDocument } from './PromtModel';

export interface UserDocument extends Document {
  ipAddress: string;
  createdAt: Date;
  prompts: Types.Array<Types.ObjectId | PromptDocument>;
  chats: Types.Array<Types.ObjectId | ChatDocument>;
}

const UserSchema = new Schema<UserDocument>({
  ipAddress: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  prompts: [{ type: Schema.Types.ObjectId, ref: 'Prompt' }],
  chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
});

export const UserModel = model<UserDocument>('User', UserSchema);
