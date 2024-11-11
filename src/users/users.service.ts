import { Injectable, Ip } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IAccount } from './interfaces/account.interface';
import { ISean } from './interfaces/sean.interface';
import { CreateAccountDto, CreateSeanDto } from './dto/account.dto';
// import { CreateChatDto } from './dto/chat.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {
    constructor (
        private jwtService: JwtService,
        @InjectModel('Account') private readonly accountModel: Model<IAccount>,
        @InjectModel('Sean') private readonly seanModel: Model<ISean>,
    ) {};

    // constructor (
    //     @InjectModel('Account') private readonly accountModel Model<IAccount>,
    //     @InjectModel('Chat') private readonly chatModel: Model<IChat>,
    // ) {};

    private async checkIfEmailExists(email: string): Promise<boolean> {
        const account = await this.accountModel.findOne({ email }).exec();
        return account ? true : false; // agar foydalanuvchi topilsa, true qaytaradi
    }

    async createAccount(createAccountDto: CreateAccountDto): Promise<ISean | Error> {
        if(await this.checkIfEmailExists(createAccountDto.email)) {
            console.log("if ichida");
            return new Error("user is already registired");
        }
        const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);
        createAccountDto.password = hashedPassword;
        const createAccount = await new this.accountModel(createAccountDto).save();
        const token = await this.jwtService.sign({account: createAccountDto.email}); // id orqali token yaratish qanday buladi
        const createSean = new this.seanModel({account_id: createAccount.id, token});
        return createSean.save();        
    };

    async createChat(createAccountDto: CreateSeanDto): Promise<ISean | Error> {
        const account = await this.accountModel.findOne({ email: createAccountDto.email }).exec();
        if(account && await bcrypt.compare(createAccountDto.password, account.password)) {
            const token = this.jwtService.sign({account: account.email});
            const createSean = new this.seanModel({account_id: account.id, token});
            return createSean.save();
        } 
        return new Error("email is not registired yet");
    };

    //bu ustida qayta ishlash kerak
    async logoutChat(token: string): Promise<any> {
        const result = await this.seanModel.deleteOne({token});
        if(result.deletedCount === 0) {
            return new Error("Item not found with the provided token")
        }
        return true;
    } 

    // bu ustida ham o'ylab ko'rish kerak
    async deleteAccount(id: string): Promise<any> {
        await this.seanModel.deleteMany({ account_id: id });
        return this.accountModel.findByIdAndDelete(id).exec();
    }
}
