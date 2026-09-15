import { Injectable, NotFoundException } from '@nestjs/common';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../common/dynamodb/dynamodb.client';

export interface Slot {
  doctorId: string;
  dateTime: string;
  slotId: string;
  date: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
}

function makeSlotId(): string {
  return `SLT-${Math.floor(100 + Math.random() * 900)}${Date.now() % 1000}`;
}

@Injectable()
export class SlotsService {
  // Query on doctorId (partition key). No manual sorting needed here -
  // DynamoDB already returns items in sort-key (dateTime) order.
  async findByDoctor(doctorId: string): Promise<Slot[]> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.SLOTS,
        KeyConditionExpression: 'doctorId = :doctorId',
        ExpressionAttributeValues: { ':doctorId': doctorId },
      }),
    );
    return (result.Items as Slot[]) || [];
  }

  async create(doctorId: string, data: { date: string; time: string }): Promise<Slot> {
    const newSlot: Slot = {
      doctorId,
      dateTime: `${data.date}#${data.time}`,
      slotId: makeSlotId(),
      date: data.date,
      time: data.time,
      status: 'available',
    };
    await ddb.send(new PutCommand({ TableName: TABLES.SLOTS, Item: newSlot }));
    return newSlot;
  }

  // Only slotId is known here - go through the slotId-index GSI to find
  // the full key (doctorId + dateTime) needed to update the item.
  async findOne(id: string): Promise<Slot> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.SLOTS,
        IndexName: 'slotId-index',
        KeyConditionExpression: 'slotId = :slotId',
        ExpressionAttributeValues: { ':slotId': id },
      }),
    );
    const item = result.Items?.[0] as Slot | undefined;
    if (!item) throw new NotFoundException(`Slot ${id} not found`);
    return item;
  }

  async updateStatus(id: string, status: Slot['status']): Promise<Slot> {
    const slot = await this.findOne(id);
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLES.SLOTS,
        Key: { doctorId: slot.doctorId, dateTime: slot.dateTime },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes as Slot;
  }
}
