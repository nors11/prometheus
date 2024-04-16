import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MqttService } from './v1/common/services/mqtt.service';
import { OnlineServicesService } from './v1/common/services/online-services.service';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const options = new DocumentBuilder()
  .setTitle('Api document')
  .setDescription('The API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
    
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);
  app.enableCors();
  await app.listen((process.env.PORT) ? process.env.PORT : 3000);
  const mqttService = app.get(MqttService);
  const onlineServicesService = app.get(OnlineServicesService);
  await onlineServicesService.addCronJob();
  mqttService.connect();
}
bootstrap();
