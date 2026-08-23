import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateBookingDto } from '../common/dto/create-booking.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

interface AuthedRequest extends Request {
  user?: { username: string; role: string };
}

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /bookings  { slotId }  - Patient only
  @Post()
  @UseGuards(RolesGuard)
  @Roles('patient')
  create(@Req() req: AuthedRequest, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user!.username, dto.slotId);
  }

  // GET /bookings/mine  - Patient only, scoped to the logged-in user
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('patient')
  findMine(@Req() req: AuthedRequest) {
    return this.bookingsService.findMine(req.user!.username);
  }

  // PATCH /bookings/:id  { status: "cancelled" }  - Patient or Provider
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('patient', 'provider')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.bookingsService.updateStatus(id, dto.status as any);
  }
}

@Controller('providers/:providerId/bookings')
export class ProviderBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // GET /providers/:providerId/bookings  - Provider only
  @Get()
  @UseGuards(RolesGuard)
  @Roles('provider')
  findForProvider(@Param('providerId') providerId: string) {
    return this.bookingsService.findForProvider(providerId);
  }
}
