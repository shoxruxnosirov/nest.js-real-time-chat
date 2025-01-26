import { Body, Controller, Post, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { UsersService } from './users.service';
import { join } from 'path';
import { IAccount } from './interfaces/account.interface';
import { Types } from 'mongoose';

@Controller('auth')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
    ) {};

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        try {
            const user = req.user; 
            if(!user?.name) {
                return res.send("google auth err");
            } 
            const data = await this.userService.createAccount(user);
            // console.log('user data: ', data);
            const filePath = join(process.cwd(), 'views', 'redirect_to_chat.html');
            const htmlContent = await import('fs/promises').then(fs =>
                fs.readFile(filePath, 'utf8'),
            );
            const updatedHtml = htmlContent.replace(
                '<!-- Bu joyga JSON ma\'lumot keladi -->',
                JSON.stringify(data),
            );

            res.setHeader('Content-Type', 'text/html');
            res.send(updatedHtml);

        } catch(err) {
            return res.send(err);
        }
    }

    @Post('members')
    async getGroupMembers(@Body() groupMembers: string[] | Types.ObjectId[]): Promise<IAccount[]> {
        return this.userService.getGroupMembers(groupMembers);
    }

    @Post('editusername')
    async editUsername(@Body() data: { id: string, username: string}): Promise<IAccount> {
        return this.userService.editUsername(data);
    }
}

