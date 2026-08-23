import { Injectable, NotFoundException } from '@nestjs/common';
import { providers, Provider } from '../common/data/seed';

@Injectable()
export class ProvidersService {
  findAll(city?: string, query?: string): Provider[] {
    let result = providers.filter((p) => p.status === 'approved');

    if (city) {
      result = result.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
      );
    }
    return result;

    // Real version (DynamoDB):
    // - city provided  -> Query on a GSI with partition key "city"
    // - no city         -> Scan (fine at this project's scale) filtered by status
  }

  findOne(id: string): Provider {
    const found = providers.find((p) => p.id === id);
    if (!found) throw new NotFoundException(`Provider ${id} not found`);
    return found;
  }

  findPending(): Provider[] {
    return providers.filter((p) => p.status === 'pending');
  }

  updateStatus(id: string, status: Provider['status']): Provider {
    const found = this.findOne(id);
    found.status = status;
    return found;
  }
}
