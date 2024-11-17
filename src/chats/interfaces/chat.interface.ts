import { Document } from 'mongoose';

export interface IChat extends Document {
  readonly id: string;
  readonly type: string;
  chatname?: string;
  participant_ids: string[];
  changeGroupData?: boolean[];
  removeMessage?: boolean[];
}


// export interface IAdmin {
//   readonly id: string,
//   changeGroupData: boolean,
//   removeMessage?: boolean,
// }