import { Module } from '@nestjs/common';
import { DoctorSlotsController, SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  controllers: [DoctorSlotsController, SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
