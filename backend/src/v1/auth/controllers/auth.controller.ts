import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../dto/user.dto';
import { LoginDto } from '../dto/login.dto';
import { I18nService } from 'nestjs-i18n';
import { AppConstants } from '../../../app.constants';
import { UserService } from '../services/user.service';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private i18n: I18nService
    ) {}

    @Post('login')
    async login(@Body() body: LoginDto) {
      const userValidate = await this.authService.validateUser(body.email, body.pass);
      if (!userValidate || (userValidate && userValidate.status === false)) {
        throw new UnauthorizedException(await this.i18n.translate('auth.INVALID_EMAIL_OR_PASSWORD', { lang:AppConstants.DEFAULT_LANGUAGE }));
      }

      const user = await this.userService.findRole(userValidate);
      if(user && user.distributor ) {
        if(user.distributor.status == false) {
          throw new UnauthorizedException(await this.i18n.translate('auth.INVALID_EMAIL_OR_PASSWORD', { lang:AppConstants.DEFAULT_LANGUAGE }));
        }
      }

      if(user && user['pharmacy'] && user['pharmacy']['distributor']) {
        if(user['pharmacy']['distributor'][0].status == false) {
          throw new UnauthorizedException(await this.i18n.translate('auth.INVALID_EMAIL_OR_PASSWORD', { lang:AppConstants.DEFAULT_LANGUAGE }));
        }
      }

      return this.authService.login(user);
    }
  
    @ApiOkResponse()
    @Post('register')
    async register(@Body() registerDto: CreateUserDTO): Promise<User> {
        return this.authService.register(registerDto);
    }

}