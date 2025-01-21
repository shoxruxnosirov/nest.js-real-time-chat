import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  getGoogleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID');
  }
  getGoogleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  }

  getWebUrl(): string {
    return this.configService.get<string>('WEB_URL');
  }

  getPort(): string {
    return this.configService.get<string>('PORT');
  }
  
  getHello(): string {
    return 'Hello World!';
  }
}
