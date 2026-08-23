import { Injectable } from '@nestjs/common';
import { providers, bookings } from '../common/data/seed';

@Injectable()
export class AdminService {
  getStats() {
    return {
      totalProviders: providers.filter((p) => p.status === 'approved').length,
      pendingProviders: providers.filter((p) => p.status === 'pending').length,
      totalBookings: bookings.length,
    };
  }
}
