import { Module } from '@nestjs/common';
import { DoctorsController, ProviderDoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

@Module({
  controllers: [DoctorsController, ProviderDoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
