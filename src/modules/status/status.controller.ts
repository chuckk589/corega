import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLocaleDto } from './dto/update-locale.dto';
import { StatusService } from './status.service';

@Controller({
  path: 'status',
  version: '1',
})
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  findAll() {
    return this.statusService.findAll();
  }

  // @Get('/stats')
  // findStatistics() {
  //   return this.statusService.findStatistics();
  // }
  @Get('/locales')
  findLocales() {
    return this.statusService.findLocales();
  }
  @UseGuards(JwtAuthGuard)
  @Put('/locales')
  updateLocales(@Body() updateLocaleDto: UpdateLocaleDto) {
    return this.statusService.updateLocales(updateLocaleDto);
  }
}
