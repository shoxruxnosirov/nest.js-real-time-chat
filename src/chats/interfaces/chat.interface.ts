import { Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IChat extends Document {
  readonly type: string;
  participant_ids: Types.ObjectId[];
  
  name?: string;
  username?: string;
  picture?: string;
  removeMessage?: boolean[];
  changeGroupData?: boolean[];
  readonly timestamp?: Date;
}

export interface IUserOrGroupChat {
  readonly type: string;
  name: string;
  chatId: Types.ObjectId | string;
  account_id?: Types.ObjectId | string;
  picture?: string;
  lastName?: string;
  username?: string;
  color?: string;
  participant_ids?: (Types.ObjectId |string)[];
  changeGroupData?: boolean[];
  readonly timestamp?: Date;

  participant_length?: number
}


// export interface IAdmin {
//   readonly id: string,
//   changeGroupData: boolean,
//   removeMessage?: boolean,
// }