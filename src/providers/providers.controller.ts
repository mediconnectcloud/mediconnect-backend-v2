import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // GET /providers?city=Hamilton&query=dental
  @Get()
  findAll(@Query('city') city?: string, @Query('query') query?: string) {
    return this.providersService.findAll(city, query);
  }

  // GET /providers/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  // PATCH /providers/:id  { status: "approved" | "rejected" }  - Admin only
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.providersService.updateStatus(id, dto.status as any);
  }
}
