// import { IAdmin } from "../interfaces/chat.interface";

export class ChatDto {
    readonly type: string;
    chatname?: string;
    participant_ids: string[];
    changeGroupData?: boolean[];
    removeMessage?: boolean[];
    // admins?: IAdmin[];
  }

  // export class AdminDto {
  // changeGroupData: boolean;
  // removeMessage?: boolean;
  // }
  
