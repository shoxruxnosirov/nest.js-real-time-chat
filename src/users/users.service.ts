import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import * as bcrypt from 'bcryptjs';
import { IAccount, ISean, ISeanAndAccount } from './interfaces/account.interface';
import { CreateAccountDto } from './dto/account.dto';
import { JwtService } from '@nestjs/jwt';
import { AppService } from 'src/app.service';


@Injectable()
export class UsersService {
    constructor (
        private jwtService: JwtService,
        private readonly appService: AppService,
        @InjectModel('Account') private readonly accountModel: Model<IAccount>,
        @InjectModel('Sean') private readonly seanModel: Model<ISean>,
    ) {};

    generateToken(user: any) {
        const payload = { email: user.email, sub: user.googleId };
        // console.log('jwt_secret: ', this.appService.getJwtSecret());
        return this.jwtService.sign(
            payload, 
            { 
                secret: this.appService.getJwtSecret(),
                // expiresIn: '1h' 
            }
        );
    }

    getRandomNonGrayColor(): string {
        let r: number, g: number, b: number;
        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        } while (this.isGray(r, g, b));
    
        return `${r},${g},${b}`;
    }
    
    isGray(r: number, g: number, b: number): boolean {
        return !( (200 < b && ( (100 < g || 100 < r ) && Math.abs(r - g) > 80 )) ||
            (200 < r && ( (100 < g || 100 < b ) && Math.abs(g - b) > 80 )) || 
            (200 < g && ( (100 < b || 100 < r ) && Math.abs(r - b) > 80 ))  );
    }

    async createAccount(createAccountDto: CreateAccountDto): Promise<ISeanAndAccount> {
        try {
            const jwtToken = this.generateToken(createAccountDto);
            // console.log("createAccountDto: ", createAccountDto);
            const {accessToken, refreshToken, ...accountDto} = createAccountDto; 
            let account: IAccount = await this.accountModel.findOne({ email: createAccountDto.email }).exec();
            if(!account) {
                accountDto.color = this.getRandomNonGrayColor();
                account = await new this.accountModel(accountDto).save();
            }
            const createSean: ISean = await new this.seanModel({account_id: account._id, accessToken, refreshToken, jwtToken} as ISean).save();
            return {_id: createSean._id, jwtToken, ...createAccountDto, account_id: account._id, color: account.color, username: account.username } as ISeanAndAccount;
        } 
        catch (err) {
            throw new ConflictException(err!.message || "unknown error");
        }    
    };

    async getGroupMembers(groupMemberIds: string[] | Types.ObjectId[]) {
        // console.log('groupMembersId: ', groupMemberIds);
        const objectIds = groupMemberIds.map(id => new Types.ObjectId(id));
        return this.accountModel.find({ '_id': { $in: objectIds } }).exec();
    }

    async searchUsername(username: string): Promise<IAccount[]> {
        const accounts = await this.accountModel.find();
        return this.accountModel.find({
            username: { $regex: new RegExp(username, 'i') }, // 'i' flag - case-insensitive
        });
    }

    async editUsername(data: { id: string, username: string}) {
        const account = await this.accountModel.findById(data.id);
        account.username = data.username;
        return account.save();
    }

    async editProfile(data: { id: string, editedField: string, data: any}) {
        const account = await this.accountModel.findById(data.id);
        if(data.editedField === 'name') {
            account.name = data.data.name;
            account.lastName = data.data.lastName;
        } else {
            account[data.editedField] = data.data;
        }
        return account.save();
    }

    async getById(id: Types.ObjectId): Promise<IAccount> {
        return this.accountModel.findById(id);
    }

    async isUsernameExists(username: string): Promise<boolean> {
        try {
            const acc = await this.accountModel.findOne({ username }).exec();
            return !!acc;
        } 
        catch(err) {
            console.log(err);
        }
    }

    async isEmailExists(email: string): Promise<boolean> {
        try {
            const acc = await this.accountModel.findOne({ email }).exec();
            return !!acc;
        } 
        catch(err) {
            console.log(err);
        }
    }
}
