import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './v1/auth/auth.module';
import { V1Module } from './v1/v1.module';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttService } from './v1/common/services/mqtt.service';
import { OutboundResponseSerializer } from './v1/common/serializers/outbound-response.serializer';
import { Cross, CrossSchema } from './v1/common/schemas/cross.schema';
import { Error, ErrorSchema } from './v1/common/schemas/error.schema';
import { ErrorService } from './v1/common/services/error.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
export interface SerializerTecneplas<TInput = any, TOutput = any> {
  serialize(value: TInput): TOutput;
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Cross.name, schema: CrossSchema }] ),
    MongooseModule.forFeature([{ name: Error.name, schema: ErrorSchema }] ),
    MongooseModule.forRoot((process.env.DB_URI) ? process.env.DB_URI : 'mongodb://tecneplas:1234@localhost:55106/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', { dbName: (process.env.DB_NAME) ? process.env.DB_NAME : 'tecneplas' }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
        loaderOptions: {
            path: path.join(__dirname, '/i18n/'),
            watch: true,
        },
    }), 
    AuthModule,
    V1Module,
    ServeStaticModule.forRoot({
        serveRoot: '/assets',
        rootPath: ((__dirname.includes('dist')) ? join(__dirname, '..', 'assets') : join(__dirname, 'assets'))
    }),
    ClientsModule.register([
      {
        name: 'TECNEPLAS_MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
          username: 'x25fr3KWzmdG@tecneplas.tld',
          password: 'NFMK&tt###Ye7DU4DNsHV!d',
          clientId: 'backend_' + Math.random().toString(16).substring(2, 10),
          serializer: new OutboundResponseSerializer()
        }
      }
    ]),
    MailerModule.forRoot({
        transport: {
            host: 'mail.tecneplas.com', 
            port: 465,
            secure: false,
            auth: {
              user: 'noreply@tecneplas.com', 
              pass: 'TECneplas2320$',
            },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
  ],
  controllers: [AppController],
  providers: [AppService, MqttService, ErrorService],
})
export class AppModule {}
 