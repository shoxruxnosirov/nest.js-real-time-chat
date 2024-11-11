import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAccountDto, CreateSeanDto } from './dto/account.dto';
import { ISean } from './interfaces/sean.interface';

@Controller('auth')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
    ) {};

    @Post('signup')
    async signup(@Body() body: CreateAccountDto): Promise<ISean | Error> {
        return this.userService.createAccount(body);
    }

    @Post('login')
    async login(@Body() body: CreateSeanDto): Promise<ISean | Error> {
        return this.userService.createChat(body);
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