import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../dto/user.dto';
import { UserService } from './user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../interfaces/user.interface';
import { ForgottenPassword } from '../schemas/forgotten-password.schema';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ForgottenPasswordService } from "./forgottenpassword.service";
import { v4 as uuid } from 'uuid';
import { AppConstants } from '../../../app.constants';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private forgottenPasswordService: ForgottenPasswordService,
    private i18n: I18nService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    // if (user && await compare(pass, user.password)) {
    if (user.password && pass) {        
        const isMatch = await bcrypt.compare(pass, user.password);
        if(isMatch) return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { id: user._id, email: user.email, name: user.name, surname: user.surname, role: user.role, id_distributor: user.id_distributor, id_pharmacy: user.id_pharmacy};
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role,
      email: user.email,
      name: user.name,
      surname: user.surname,
      id_pharmacy: user.id_pharmacy,
      id_distributor: user.id_distributor
    };
  }

    async register(userDto: CreateUserDTO): Promise<User> {
        const user = await this.userService.register(userDto);
        if(user) await this.sendEmailForgotPassword(userDto.email)
        return user;
    }

    async sendEmailForgotPassword(email: string): Promise<boolean> {
        let user = await this.userService.findByEmail(email);
        if (!user) throw new HttpException(await this.i18n.translate('auth.USER_NOT_FOUND', { lang: AppConstants.DEFAULT_LANGUAGE }), HttpStatus.NOT_FOUND);

        const tokenModel = await this.createForgottenPasswordToken(email);
        if (tokenModel && tokenModel.token) {
            let url = (AppConstants.FRONTEND_URL.endsWith('/')) ? AppConstants.FRONTEND_URL : AppConstants.FRONTEND_URL + '/';
            const sent = await this.mailerService.sendMail({
                to: email,
                from: 'noreply@tecneplas.com',
                subject: await this.i18n.translate('auth.SUBJECT_RESET_PASSWORD', { lang: AppConstants.DEFAULT_LANGUAGE }),
                template: './forgotten-password',
                context: {
                    user_name: user.name,
                    url: url + 'account/reset-password/' + tokenModel.token
                }
            })
            .then((res) => {
                console.log('SUCCESS');
                console.log(res);
                return true;
            })
            .catch((err) => {
                console.log('Error');
                console.log(err);
                return false;
            });
            return sent;
        } else {
            console.log('auth.USER_NOT_REGISTERED');
            throw new HttpException('auth.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
        }
    }

    async createForgottenPasswordToken(email: string): Promise<ForgottenPassword> {
        const filter = { email: email };
        const update = {
            email: email,
            token: uuid(),
            creation_date: new Date()
        };

        let forgottenPasswordModel = await this.forgottenPasswordService.findOneAndUpdate(filter, update);
        if(forgottenPasswordModel){
            return forgottenPasswordModel;
        } else {
            throw new HttpException(await this.i18n.translate('auth.DATABASE_ERROR', { lang:AppConstants.DEFAULT_LANGUAGE }), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}