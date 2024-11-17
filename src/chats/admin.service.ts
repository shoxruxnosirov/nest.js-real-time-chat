// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// // import { IAdmin } from './interfaces/chat.interface';
// // import { AdminDto } from './dto/chat.dto';

// @Injectable()
// export class AdminService {
//     constructor(@InjectModel("Admin") private readonly adminModel: Model<IAdmin>) {}

//     async create(adminDto: AdminDto): Promise<IAdmin> {
//         const createdAdmin = new this.adminModel(adminDto);
//         return createdAdmin.save();
//       }
    
//       async findAll(): Promise<IAdmin[]> {
//         return this.adminModel.find().exec();
//       }
    
//       async findOne(id: string): Promise<IAdmin> {
//         return this.adminModel.findById(id).exec();
//       }
    
//       async update(id: string, chatDto: AdminDto): Promise<IAdmin> {
//         return this.adminModel.findByIdAndUpdate(id, chatDto, { new: true }).exec();
//       }
    
//       async delete(id: string): Promise<any> {
//         return this.adminModel.findByIdAndDelete(id).exec();
//       }

//       async findUserChats(id: string): Promise<IAdmin[]> {
//         try {
//           return this.adminModel.find({
//             participant_ids: {$in: id}
//           }).exec();
//           // const allRooms = await this.chatModel.find();
//           // const rooms = allRooms.filter(item => {
//           //   console.log("id: ", id, "\nparticipant_ids: ", item.participant_ids);
//           //   return item.participant_ids.includes(id);
//           // });
//           // return rooms;
//         } 
//         catch(err) {
//           console.log(err);
//         }
//       }
// }
