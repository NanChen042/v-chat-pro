import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 开启跨域支持
  app.useGlobalInterceptors(new TransformInterceptor()); // 全局标准响应拦截器
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
