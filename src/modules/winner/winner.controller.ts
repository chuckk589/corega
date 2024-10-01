// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
// import { WinnerService } from './winner.service';
// import { UpdateWinnerDto } from './dto/update-winner.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @Controller({
//   path: 'winner',
//   version: '1',
// })
// @UseGuards(JwtAuthGuard)
// export class WinnerController {
//   constructor(private readonly winnerService: WinnerService) {}

//   @Put(':id')
//   update(@Param('id') id: string, @Body() updateWinnerDto: UpdateWinnerDto) {
//     return this.winnerService.update(+id, updateWinnerDto);
//   }

//   // @Post(':id/notification')
//   // notify(@Param('id') id: string) {
//   //   return this.winnerService.sendNotification(+id);
//   // }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.winnerService.remove(+id);
//   }
// }
