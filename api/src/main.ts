import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

import * as dynamoose from 'dynamoose';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dynamoose.aws.ddb.local("http://localhost:4566");

  // const ddb = new dynamoose.aws.ddb.DynamoDB({
  //   credentials: {
  //     "secretAccessKey": "SECRET",
  //     "accessKeyId": null,
  //   },
  //   "region": "us-east-1"
  // });

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Trips')
    .setDescription('Trips API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
