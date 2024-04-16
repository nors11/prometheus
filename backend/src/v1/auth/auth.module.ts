import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppConstants } from '../../app.constants';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

import { AuthController } from './controllers/auth.controller';
import { UserController } from "./controllers/user.controller";

import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ForgottenPasswordService } from './services/forgottenpassword.service';

import { UserSchema } from './schemas/user.schema';
import { ForgottenPassword, ForgottenPasswordSchema } from "./schemas/forgotten-password.schema";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: 'User', schema: UserSchema }] ),
      MongooseModule.forFeature([{ name: ForgottenPassword.name, schema: ForgottenPasswordSchema }] ),
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({ secret: AppConstants.JWT_SECRET_KEY, signOptions: { expiresIn: '2h' } }),
      MailerModule.forRootAsync({
        useFactory: () => ({
            transport: 'smtps://noreply@tecneplas.com:TECneplas2320$@mail.tecneplas.com',
            defaults: {
                from:'<noreply@tecneplas.com>',
            },
            template: {
                dir: ((__dirname.includes('/home/backend')) ? '/home/backend/templates/' : path.join(process.cwd(), '/templates/')),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
            options: {
                partials: {
                    dir: ((__dirname.includes('/home/backend')) ? '/home/backend/templates/partials' : path.join(process.cwd(), 'templates/partials')),
                    options: {
                        strict: true,
                    },
                }
            }
        })
    }),
  ],
  providers: [
      AuthService,
      UserService,
      ForgottenPasswordService,
      LocalStrategy,
      JwtStrategy
  ],
  controllers: [
      AuthController,
      UserController
  ],
})
export class AuthModule {}