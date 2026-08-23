import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProvidersService } from '../providers/providers.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly providersService: ProvidersService,
  ) {}

  // GET /admin/stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // GET /admin/providers/pending
  @Get('providers/pending')
  getPendingProviders() {
    return this.providersService.findPending();
  }
}
