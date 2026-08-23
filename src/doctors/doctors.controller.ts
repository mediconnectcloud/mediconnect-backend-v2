import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateDoctorDto } from '../common/dto/create-doctor.dto';

@Controller('providers/:providerId/doctors')
export class ProviderDoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // GET /providers/:providerId/doctors
  @Get()
  findByProvider(@Param('providerId') providerId: string) {
    return this.doctorsService.findByProvider(providerId);
  }

  // POST /providers/:providerId/doctors  - Provider only
  @Post()
  @UseGuards(RolesGuard)
  @Roles('provider')
  create(@Param('providerId') providerId: string, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(providerId, dto);
  }
}

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // GET /doctors/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  // DELETE /doctors/:id  - Provider only
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('provider')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
