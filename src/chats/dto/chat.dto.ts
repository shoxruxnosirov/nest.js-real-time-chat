// import { IAdmin } from "../interfaces/chat.interface";

import { Types } from "mongoose";

export class ChatDto {
    readonly type: string;
    chatname?: string;
    participant_ids: Types.ObjectId[];
    changeGroupData?: boolean[];
    removeMessage?: boolean[];
    // admins?: IAdmin[];
  }

  // export class AdminDto {
  // changeGroupData: boolean;
  // removeMessage?: boolean;
  // }
  
