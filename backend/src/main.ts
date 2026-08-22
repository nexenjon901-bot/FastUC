import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Fix BigInt serialization for JSON responses (Prisma uses BigInt for telegramId)
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const helmet = require('helmet');
    app.use(helmet({ contentSecurityPolicy: false }));
  } catch {
    /* optional */
  }

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`FastPAY API listening on http://localhost:${port}`);
}
bootstrap();
