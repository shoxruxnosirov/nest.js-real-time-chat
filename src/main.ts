import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();  // CORSni yoqish
  // await app.listen(process.env.PORT ?? 3000);
  await app.listen(3000, () => {
    console.log('HTTP server is running on http://localhost:3000');
  });

  
  
  const httpAdapterHost = app.get(HttpAdapterHost);
  const server = httpAdapterHost.httpAdapter.getHttpServer(); // HttpServerni olish
  
  // Socket.IO adapterini sozlash
  app.useWebSocketAdapter(new IoAdapter(app)); // IoAdapter ni ishlatish
  
  //  // Socket.IO uchun adapterni sozlash
  //  app.useWebSocketAdapter(new IoAdapter(app));  // Socket.IO adapterini HTTP serverga o'rnatamiz
}
bootstrap();
