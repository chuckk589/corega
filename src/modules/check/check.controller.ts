import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, HttpStatus, UploadedFiles, UseInterceptors, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckService } from './check.service';
import { UpdateCheckDto } from './dto/update-check.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateCheckDto } from './dto/create-check.dto';

@Controller({
  path: 'check',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Get()
  findAll() {
    return this.checkService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCheckDto: UpdateCheckDto) {
    return this.checkService.update(+id, updateCheckDto);
  }

  @Post()
  create(@Body() createCheckDto: CreateCheckDto) {
    return this.checkService.create(createCheckDto);
  }

  @Delete()
  remove(@Query('ids') ids: string) {
    return this.checkService.remove(ids.split(',').map((id) => +id));
  }
}
