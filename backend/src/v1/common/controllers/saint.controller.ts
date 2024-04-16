import { Controller, Get, Res, HttpStatus, Post, UseInterceptors, UploadedFile, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SaintService } from '../services/saint.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/v1/auth/jwt-auth.guard';
import { diskStorage } from 'multer'
import * as path from "path";
import { AppConstants } from 'src/app.constants';
import * as TecneplasHelper from '../tecneplas.helper';
import * as fs from 'fs';
import { createHash } from 'crypto';

@ApiTags('Saint')
@Controller('v1/saint')
export class SaintController {

    constructor(
        private saintService: SaintService
    ) { }

    @ApiQuery({ name: 'lang', required: false })
    @Get('/')
    async index(@Res() res, @Query() query): Promise<[]> {
        var language = 'es';
        if(query.lang){
            language = query.lang;
        }
        var filename = 'saints_' + language + '.json';
        if(fs.existsSync(AppConstants.ASSETS_TECNEPLAS_DIRECTORY + '/' + filename)){
            var saints = JSON.parse(fs.readFileSync(AppConstants.ASSETS_TECNEPLAS_DIRECTORY + '/' + filename, 'utf8'));

            var stringifiedSaints = JSON.stringify(saints);
    
            var hashedSaints = createHash('sha256').update(stringifiedSaints).digest('base64');
            var response = { data: saints, hash: hashedSaints };

            return res.status(HttpStatus.OK).json(response);
        } 
        else{
            return res.status(HttpStatus.NOT_FOUND).json({"Error": "The file " + filename + " is not found"});
        }
    }

    @ApiQuery({ name: 'lang', required: false })
    @Post('/')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: path.join(process.cwd(), AppConstants.ASSETS_TECNEPLAS_DIRECTORY),
            filename: TecneplasHelper.generateRandomFileNameSaint,
        }),
    }))
    async uploadImage(@Res() res,@UploadedFile() file, @Query() query){
        var language = 'es';
        if(query.lang){
            language = query.lang;
        }
        var filename = 'saints_' + language + '.json';
        var saints = JSON.parse(fs.readFileSync(AppConstants.ASSETS_TECNEPLAS_DIRECTORY + '/' + filename, 'utf8'));
        if(saints) {
            this.saintService.send(saints);
        }
        return res.status(HttpStatus.OK).json(saints);
    }

}