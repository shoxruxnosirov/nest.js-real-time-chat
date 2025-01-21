import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AppService } from './app.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']; // Tokenni Authorization headerdan olish

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Bearer token formatini olish (Bearer <token>)

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      // Tokenni tekshirish
      const payload = this.jwtService.verify(token, {
        secret: this.appService.getJwtSecret(), // Maxfiy kalit
      });

      console.log('payload: ', payload);

      // Payloadni req.user ga saqlash, keyinchalik controllerda foydalanish mumkin
      // req.user = payload;

      next(); // Token to'g'ri bo'lsa, keyingi middleware yoki controllerga o'tish
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
