import { Module } from '@nestjs/common';
import { globalComposer } from './global.composer';
import { globalService } from './global.service';
// import { AccountModule } from '../account/account.module';
// import { AccountService } from '../account/account.service';
// import { AccountComposer } from '../account/account.composer';.

@Module({
  imports: [],
  providers: [globalService, globalComposer],
  exports: [globalComposer],
})
export class globalModule {}
