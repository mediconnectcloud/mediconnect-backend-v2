import { Injectable } from '@nestjs/common';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../common/dynamodb/dynamodb.client';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class AdminService {
  // Reuses ProvidersService rather than querying Providers directly here -
  // same reasoning as any other layer: one function already knows how to
  // correctly filter approved vs pending, so admin stats call it instead
  // of re-implementing that logic a second time.
  constructor(private readonly providersService: ProvidersService) {}

  async getStats() {
    const [approvedProviders, pendingProviders, bookingsCount] = await Promise.all([
      this.providersService.findAll(),
      this.providersService.findPending(),
      ddb.send(new ScanCommand({ TableName: TABLES.BOOKINGS, Select: 'COUNT' })),
    ]);

    return {
      totalProviders: approvedProviders.length,
      pendingProviders: pendingProviders.length,
      totalBookings: bookingsCount.Count ?? 0,
    };
  }
}
