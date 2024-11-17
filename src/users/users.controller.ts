import { Body, Controller, Delete, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateAccountDto, CreateSeanDto } from './dto/account.dto';
import { ISean } from './interfaces/sean.interface';
import { ChatsService } from 'src/chats/chats.service';
import { IChat } from 'src/chats/interfaces/chat.interface';

type ChatsAndSean = {
    rooms: IChat[];
    sean: ISean;
  }

@Controller('auth')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly roomsService: ChatsService,
    ) {};

    @Post('signup')
    async signup(@Body() body: CreateAccountDto): Promise< ISean > {
        const userSean: ISean = await this.userService.createAccount(body);
        return userSean;
        // res.redirect(301, "http://localhost:3000/chat");
    }

    @Post('login')
    async login(@Body() body: CreateSeanDto): Promise< ISean > {
        // console.log("keldi: ", body);
        const userSean: ISean =  await this.userService.createSean(body);
        // const rooms: IChat[] = await this.roomsService.findUserChats(userSean.account_id);
        return userSean;
    }

    @Post('logout')
    async logout(@Body() body: { token: string }): Promise<any> {
        return this.userService.logoutChat(body.token);
    };

    @Delete('delete/:id')
    async deleteAccount(@Param('id') id: string): Promise<any> {
        return this.userService.deleteAccount(id);
    }
}



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50Ijoia2ltZHVyM0BnbWFpbC5jb20iLCJpYXQiOjE3MzEyMjMzMzF9.iUPdS8bXzsJEzdtXEF5RAujspUCVXBSgF-XyqkL1uBM
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50Ijoia2ltZHVyM0BnbWFpbC5jb20iLCJpYXQiOjE3MzEyMjM0MTB9.jAx1rvz6g32xjHFnj5bTff011bx0y_7R5PXXI6XJP2Y