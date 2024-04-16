import { Controller, Get, Res, HttpStatus, Post, Body, Put, Query, NotFoundException, Delete, Param, UseGuards } from '@nestjs/common';
import { DistributorService } from '../services/distributor.service';
import { Distributor } from '../schemas/distributor.schema';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CreateDistributorDTO } from '../dto/distributor.dto';
import { UserService } from '../../auth/services/user.service';

const mongoose = require('mongoose');

@ApiTags('Distributor')
@Controller('v1/distributor')
export class DistributorController {constructor(private distributorService: DistributorService, private userService: UserService){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() distributor: CreateDistributorDTO){
        const newDistributor = await this.distributorService.create(distributor);

        return res.status(HttpStatus.OK).json({
            message: 'Distributor successfully Created',
            newDistributor
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/')
    async index(@Res() res, @Query() query): Promise<Distributor[]>{

        const distributors = await this.distributorService.findAll(query);

        return res.status(HttpStatus.OK).json(distributors)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/count')
    async count(@Res() res): Promise<number>{
        const countDistributors = await this.distributorService.count();

        return res.status(HttpStatus.OK).json(countDistributors)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:distributorID')
    async view(@Res() res, @Param('distributorID') distributorID): Promise<Distributor>{
    
        if(!mongoose.isValidObjectId(distributorID)){
            throw new HttpException('Invalid distributorID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const distributor = await this.distributorService.findById(distributorID);
        
            if(!distributor) 
            {
                throw new NotFoundException('Distributor Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Distributor created successfully.',
                distributor
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:distributorID')
    async delete(@Res() res, @Param('distributorID') distributorID): Promise<Distributor>{

        if(!mongoose.isValidObjectId(distributorID)){
            throw new HttpException('Invalid distributorID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedDistributor = await this.distributorService.delete(distributorID);

            if(deletedDistributor) {
                const users = await this.userService.findByDistributor(deletedDistributor['_id']);
                users.forEach(user => {
                    this.userService.delete(user['id']);
                });
            }
        
            if(!deletedDistributor) 
            {
                throw new NotFoundException('Distributor Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Distributor deleted successfully.',
                deletedDistributor
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:distributorID')
    async update(@Res() res, @Param('distributorID') distributorID, @Body() distributor): Promise<Distributor>{

        if(!mongoose.isValidObjectId(distributorID)){
            throw new HttpException('Invalid distributorID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedDistributor = await this.distributorService.update(distributorID, distributor);

            if(updatedDistributor) {
                const users = await this.userService.findByDistributor(updatedDistributor['_id']);
                users.forEach(user => {
                    user.status = updatedDistributor.status
                    this.userService.update(user['id'], user)
                });
            }
        
            if(!updatedDistributor) 
            {
                throw new NotFoundException('Distributor Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Distributor updated successfully.',
                updatedDistributor
            })
        }
    }
}