import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  const webUrl = configService.get<string>('WEB_URL', 'http://localhost');
  const port = configService.get<string>('PORT', '3000')
 
  // app.enableCors({
  //   origin: `${webUrl}:${port}`, 
  //   credentials: true,
  // });

  app.useWebSocketAdapter(new IoAdapter(app)); 

  await app.listen(port, () => console.log(`HTTP server is running on ${webUrl}:${port}`));

}
bootstrap();
