import { Module } from '@nestjs/common';
import { BookingsController, ProviderBookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DoctorsModule } from '../doctors/doctors.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [DoctorsModule, ProvidersModule],
  controllers: [BookingsController, ProviderBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
