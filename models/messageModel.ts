import { model, Schema, Document } from "mongoose";

interface IUser {
  id: string;
  firstname: string;
  profilePicture: string;
}

export interface IMessage {
  id: string;
  text: string;
  createdAt: string;
  user: {
    _id: String; // sender_id
    name: String; // sender_name
    avatar: String; // sender_photo
  };
}

interface IMessageDocument extends Document {
  members: IUser[];
  latestMessage: string;
  unreadSender: string;
  unread: boolean;
  pushTokens: string[];
  dateSent: Date;
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    latestMessage: String,
    pushTokens: Array,
    unreadSender: String,
    unread: Boolean,
    members: Array,
    dateSent: Date,
    messages: [
      {
        id: String, // message_id
        text: String, // message_content
        createdAt: String, // message_creation_time
        user: {
          _id: String, // sender_id
          name: String, // sender_name
          avatar: String, // sender_photo
        },
      },
    ],
  },
  {
    strict: false, // There may be some problems in type casting. So disable strict mode.
  }
);

const Message = model<IMessageDocument>("Message", MessageSchema);

export default Message;
