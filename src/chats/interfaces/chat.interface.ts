import { Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IChat extends Document {
  readonly id: string | Types.ObjectId;
  readonly type: string;
  chatname?: string;
  participant_ids: Types.ObjectId[];
  changeGroupData?: boolean[];
  removeMessage?: boolean[];
}


// export interface IAdmin {
//   readonly id: string,
//   changeGroupData: boolean,
//   removeMessage?: boolean,
// }