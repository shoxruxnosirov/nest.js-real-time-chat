import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFile } from './interfaces/files.interface';
import { CreateFileDto } from './dto/createFile.dto';

@Injectable()
export class FilesService {

    constructor(@InjectModel("File") private readonly fileModel: Model<IFile>) {}
    
    async create(createFileDto: CreateFileDto): Promise<IFile> {
        const createdFile = new this.fileModel(createFileDto);
        return createdFile.save();
      }
    
      async findAll(): Promise<IFile[]> {
        return this.fileModel.find().exec();
      }
    
      async findOne(id: string): Promise<IFile> {
        return this.fileModel.findById(id).exec();
      }
    
      async update(id: string, createFileDto: CreateFileDto): Promise<IFile> {
        return this.fileModel.findByIdAndUpdate(id, createFileDto, { new: true }).exec();
      }
    
      async delete(id: string): Promise<any> {
        return this.fileModel.findByIdAndDelete(id).exec();
      }
}
