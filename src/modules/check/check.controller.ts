import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpException, HttpStatus, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckService } from './check.service';
import { UpdateCheckDto } from './dto/update-check.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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

  // @Post('import')
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'checks' }]))
  // async create(@UploadedFiles() files: { checks?: Express.Multer.File[] }) {
  //   const { checks } = files;
  //   if (!checks) {
  //     throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
  //   }
  //   return await this.checkService.parseChecksFile(checks[0].buffer);
  // }
}
