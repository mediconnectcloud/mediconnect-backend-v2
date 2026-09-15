import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../common/dynamodb/dynamodb.client';

export interface Provider {
  providerId: string;
  facilityId?: string;
  name: string;
  type: string;
  city: string;
  address?: string;
  phone?: string;
  hours?: string;
  lat?: number;
  lon?: number;
  status: 'approved' | 'pending' | 'rejected';
}

@Injectable()
export class ProvidersService {
  async findAll(city?: string, query?: string): Promise<Provider[]> {
    let items: Provider[];

    if (city) {
      // city given -> Query the city-index GSI directly, instead of
      // scanning the whole table. This is the fast path the GSI exists for.
      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLES.PROVIDERS,
          IndexName: 'city-index',
          KeyConditionExpression: 'city = :city',
          ExpressionAttributeValues: { ':city': city },
        }),
      );
      items = (result.Items as Provider[]) || [];
    } else {
      // no city filter -> Scan the whole table. Fine at this data volume
      // (a handful of providers); would need rethinking at real scale.
      const result = await ddb.send(new ScanCommand({ TableName: TABLES.PROVIDERS }));
      items = (result.Items as Provider[]) || [];
    }

    // Only ever show approved providers to patients searching
    items = items.filter((p) => p.status === 'approved');

    // Free-text name/type match happens in application code - DynamoDB
    // has no built-in "contains" search across arbitrary fields the way
    // a SQL LIKE query does.
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
      );
    }

    return items;
  }

  async findOne(id: string): Promise<Provider> {
    const result = await ddb.send(
      new GetCommand({ TableName: TABLES.PROVIDERS, Key: { providerId: id } }),
    );
    if (!result.Item) throw new NotFoundException(`Provider ${id} not found`);
    return result.Item as Provider;
  }

  async findPending(): Promise<Provider[]> {
    // A Scan with a filter, same reasoning as findAll's no-city branch -
    // acceptable at this table size, would become a GSI on status if the
    // platform grew to real numbers of providers.
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLES.PROVIDERS,
        FilterExpression: '#status = :pending',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':pending': 'pending' },
      }),
    );
    return (result.Items as Provider[]) || [];
  }

  async updateStatus(id: string, status: Provider['status']): Promise<Provider> {
    // Confirm it exists first, so a bad ID gives a clear 404 instead of
    // DynamoDB silently creating a near-empty item on UpdateCommand.
    await this.findOne(id);

    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLES.PROVIDERS,
        Key: { providerId: id },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes as Provider;
  }
}
