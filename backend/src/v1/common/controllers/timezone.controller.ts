import { Controller, Get, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { TimezoneService } from '../services/timezone.service';
import { Timezone } from '../schemas/timezone.schema';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";

@ApiTags('Timezone')
@Controller('v1/timezone')

export class TimezoneController {constructor(private timezoneService: TimezoneService){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async index(@Res() res): Promise<Timezone[]>{
        const timezones = await this.timezoneService.findAll();
        return res.status(HttpStatus.OK).json({
            timezones
        })
    }
}