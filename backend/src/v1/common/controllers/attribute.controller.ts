import { Controller, Res, Get, UseGuards, HttpStatus, Param, Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AttributeService } from '../services/attribute.service';
import { AttributeOption } from '../schemas/attribute.schema';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppConstants } from 'src/app.constants';
import * as path from 'path';
import * as TecneplasHelper from '../tecneplas.helper';

@ApiTags('Attribute')
@Controller('v1/attribute')
export class AttributeController {
    constructor(
        private attributeService: AttributeService
    ){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/type/:type/option')
    async indexOptionsByType(@Res() res, @Param('type') type): Promise<AttributeOption[]>{
        const distributors = await this.attributeService.findAllOptionsByType(type);
        return res.status(HttpStatus.OK).json(distributors);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: path.join(process.cwd(), AppConstants.ASSETS_TECNEPLAS_DIRECTORY),
            filename: TecneplasHelper.generateRandomFileName,
        }),
    }))
    @Post('/type/:type/option')
    async createOptionByType(@Res() res, @Param('type') type, @UploadedFile() file, @Body() model: AttributeOption){
        model.path = 'assets/uploads/tecneplas' + `/${file.filename}`;
        const newAttributeOption = await this.attributeService.createAttributeOptionByType('animation', model);

        return res.status(HttpStatus.OK).json('newAttributeOption');
    }

}