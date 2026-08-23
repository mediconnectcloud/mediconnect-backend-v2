import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProvidersModule } from './providers/providers.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SlotsModule } from './slots/slots.module';
import { BookingsModule } from './bookings/bookings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ProvidersModule,
    DoctorsModule,
    SlotsModule,
    BookingsModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
