import { IMessage } from "src/messages/interfaces/message.interface";

export interface ISendMessage {
    message: IMessage;
    replying_for_Ms?: IMessage,
};

