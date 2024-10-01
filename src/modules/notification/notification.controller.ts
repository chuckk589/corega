import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFiles, UseInterceptors, Req, HttpStatus, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RetrieveNotificationDto } from './dto/retrieve-notification.dto';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller({
  path: 'notification',
  version: '1',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async create(@Body() createNotificationDto: CreateNotificationDto, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
    await this.notificationService.create(createNotificationDto, files);
    return HttpStatus.CREATED;
  }
  @Post('test')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async test(@Body() createNotificationDto: CreateNotificationDto, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
    await this.notificationService.test(createNotificationDto, files);
    return HttpStatus.OK;
  }
  @Put(':id')
  async update(@Body() updateNotificationDto: UpdateNotificationDto, @Param('id') id: string) {
    await this.notificationService.update(updateNotificationDto, +id);
    return HttpStatus.OK;
  }
  @Get()
  async findAll(): Promise<RetrieveNotificationDto[]> {
    return await this.notificationService.findAll();
  }
  @Get('templates')
  async templates() {
    return await this.notificationService.getTemplates();
  }
}
