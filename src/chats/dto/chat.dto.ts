// import { IAdmin } from "../interfaces/chat.interface";

import { Types } from "mongoose";

export class ChatDto {
    readonly type: string;
    participant_ids: Types.ObjectId[];

    name?: string;
    username?: string;
    picture?: string;
    changeGroupData?: boolean[];
    removeMessage?: boolean[];
    readonly timestamp?: Date;
  }
