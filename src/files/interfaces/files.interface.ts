import { Document } from 'mongoose';

export interface IFile extends Document {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly type: string;
}
