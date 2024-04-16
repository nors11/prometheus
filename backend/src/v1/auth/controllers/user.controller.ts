import { Controller, Get, Res, HttpStatus, NotFoundException, Delete, Param, UseGuards, Post, Body, Put, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgottenPasswordService } from '../services/forgottenpassword.service';
import { AppConstants } from '../../../app.constants';
import { I18nService } from 'nestjs-i18n';

const mongoose = require('mongoose');

@ApiTags('User')
@Controller('v1/user')
export class UserController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private forgottenPasswordService: ForgottenPasswordService,
        private i18n: I18nService
    ){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/')
    async getUsers(@Res() res, @Query() query): Promise<User[]>{
        const accounts = await this.userService.findAll(query);
        const countUsers = await this.userService.count();
        return res.status(HttpStatus.OK).json({
            accounts,
            countUsers
        })
    }

    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/pharmacy/:pharmacyID')
    async users(@Res() res, @Param('pharmacyID') pharmacyID, @Query() query): Promise<User[]>{
    
        if(!mongoose.isValidObjectId(pharmacyID)){
            throw new HttpException('Invalid pharmacyID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const accounts = await this.userService.findUsersByPharmacy(pharmacyID, query);
            const countUsers = await this.userService.count({id_pharmacy: pharmacyID});

            if(!accounts) 
            {
                throw new NotFoundException('Pharmacy Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                accounts,
                countUsers
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:userID')
    async getUser(@Res() res, @Param('userID') userID): Promise<User>{
       
        if(!mongoose.isValidObjectId(userID)){
            throw new HttpException('auth.INVALID_USERID', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const user = await this.userService.findById(userID);
        
            if(!user) 
            {
                throw new NotFoundException('auth.USER_DOEST_NOT_EXIST');
            }
            return res.status(HttpStatus.OK).json(user)
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('email/:email')
    async validateEmail(@Res() res, @Param('email') email): Promise<User>{
       
        const user = await this.userService.findByEmail(email);
    
        if(user) 
        {
            throw new NotFoundException('User exist');
        }
        return res.status(HttpStatus.OK).json({
            message: 'User not exist'
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() user){
        
        const newUser = await this.userService.create(user);

        return res.status(HttpStatus.OK).json({
            message: 'User successfully Created',
            newUser
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:userID')
    async update(@Res() res, @Param('userID') userID, @Body() user): Promise<User>{

        if(!mongoose.isValidObjectId(userID)){
            throw new HttpException('Invalid userID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedUser = await this.userService.update(userID, user);
        
            if(!updatedUser) 
            {
                throw new NotFoundException('Cross User not exists.');
            }
            return res.status(HttpStatus.OK).json(
                updatedUser
            )
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/delete/:userID')
    async deleteUser(@Res() res, @Param('userID') userID): Promise<User>{

        if(!mongoose.isValidObjectId(userID)){
            throw new HttpException('auth.INVALID_USERID', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedUser = await this.userService.delete(userID);
        
            if(!deletedUser) 
            {
                throw new NotFoundException('auth.USER_DOEST_NOT_EXIST');
            }
            return res.status(HttpStatus.OK).json({
                message: 'auth.USER_DELETED_SUCCESSFULLY',
                deletedUser
            })
        }
    }

    @ApiParam({ name: 'email', required: true})
    @Get('forgot-password/:email')
    async forgotPassword(@Res() res, @Param('email') email): Promise<User>{

        if(!email) throw new HttpException('auth.EMAIL_FIELD_IS_REQUIRED', HttpStatus.UNPROCESSABLE_ENTITY);

        try {
            let isEmailSent = await this.authService.sendEmailForgotPassword(email);

            if(isEmailSent) {
                return res.status(HttpStatus.OK).json({
                    message: await this.i18n.translate('auth.PASSWORD_RESET_SUCCESSFULLY', { lang:AppConstants.DEFAULT_LANGUAGE })
                });
            }
            else {
                return res.status(HttpStatus.OK).json({
                    message: 'auth.ERROR_SENDING_EMAIL'
                });
            }
        }
        catch(error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @Post('reset-password')
    public async resetPassord(@Res() res, @Body() resetPassword: ResetPasswordDto): Promise<any> {
        try {
            let isNewPasswordChanged: boolean = false;
            if (resetPassword.token) {
                let forgottenPassword = await this.forgottenPasswordService.findOne({ email:resetPassword.email, token: resetPassword.token });
                if(forgottenPassword) {
                    isNewPasswordChanged = await this.userService.setPassword(forgottenPassword.email, resetPassword.password);
                    if (isNewPasswordChanged) await this.forgottenPasswordService.delete(forgottenPassword['_id']);
                }
                else{
                    throw new HttpException(await this.i18n.translate('auth.INVALID_EMAIL_TOKEN', { lang:AppConstants.DEFAULT_LANGUAGE }), HttpStatus.UNPROCESSABLE_ENTITY);
                }
            } else {
                throw new HttpException(await this.i18n.translate('auth.ERROR_CHANGING_PASSWORD', { lang:AppConstants.DEFAULT_LANGUAGE }), HttpStatus.UNPROCESSABLE_ENTITY);
            }
            return res.status(HttpStatus.OK).json({
                message: await this.i18n.translate('auth.PASSWORD_CHANGED_SUCCESSFULLY', { lang:AppConstants.DEFAULT_LANGUAGE })
            });
        } catch(error) {
            throw new HttpException(error.response, error.status);
        }

        return null;
    }
}