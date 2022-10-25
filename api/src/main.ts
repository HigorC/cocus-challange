import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as dynamoose from 'dynamoose';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dynamoose.aws.ddb.local("http://localhost:4566");

//   const ddb = new dynamoose.aws.ddb.DynamoDB({
//     "accessKeyId": null,
//     "secretAccessKey": "SECRET",
//     "region": "us-east-1"
// });

// Set DynamoDB instance to the Dynamoose DDB instance
// dynamoose.aws.ddb.set(ddb);

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
