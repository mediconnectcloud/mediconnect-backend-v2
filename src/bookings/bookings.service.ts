import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../common/dynamodb/dynamodb.client';
import { DoctorsService } from '../doctors/doctors.service';
import { ProvidersService } from '../providers/providers.service';

export interface Booking {
  bookingId: string;
  patientUsername: string;
  doctorId: string;
  doctorName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}

function makeBookingId(): string {
  return `BKG-${Date.now().toString().slice(-6)}`;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly providersService: ProvidersService,
  ) {}

  // The one transactional flow in the system. Looks up the slot via its
  // GSI, then names the doctor/provider (reusing the same services those
  // features already have, rather than querying DynamoDB a second way),
  // then writes both the slot update and the new booking as a single
  // TransactWriteItems call - so the two writes can never happen only
  // halfway. A ConditionExpression on the slot guards against two people
  // booking the exact same slot at the exact same moment: whichever
  // request's transaction commits first wins, the second is rejected by
  // DynamoDB itself, not by application logic racing against itself.
  async create(patientUsername: string, slotId: string): Promise<Booking> {
    const slotResult = await ddb.send(
      new QueryCommand({
        TableName: TABLES.SLOTS,
        IndexName: 'slotId-index',
        KeyConditionExpression: 'slotId = :slotId',
        ExpressionAttributeValues: { ':slotId': slotId },
      }),
    );
    const slot = slotResult.Items?.[0];
    if (!slot || slot.status !== 'available') {
      throw new BadRequestException('Sorry, that slot is no longer available.');
    }

    const doctor = await this.doctorsService.findOne(slot.doctorId).catch(() => null);
    const provider = doctor ? await this.providersService.findOne(doctor.providerId).catch(() => null) : null;

    const booking: Booking = {
      bookingId: makeBookingId(),
      patientUsername,
      doctorId: slot.doctorId,
      doctorName: doctor?.name ?? 'Unknown doctor',
      providerId: doctor?.providerId ?? 'Unknown',
      providerName: provider?.name ?? 'Unknown provider',
      date: slot.date,
      time: slot.time,
      status: 'confirmed',
    };

    try {
      await ddb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: TABLES.SLOTS,
                Key: { doctorId: slot.doctorId, dateTime: slot.dateTime },
                UpdateExpression: 'SET #status = :booked',
                ConditionExpression: '#status = :available',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: { ':booked': 'booked', ':available': 'available' },
              },
            },
            {
              Put: { TableName: TABLES.BOOKINGS, Item: booking },
            },
          ],
        }),
      );
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw new BadRequestException('Sorry, that slot was just booked by someone else.');
      }
      throw err;
    }

    return booking;
  }

  // Query the patientUsername-index GSI - one Query answers "my bookings"
  // with no follow-up lookups needed.
  async findMine(patientUsername: string): Promise<Booking[]> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.BOOKINGS,
        IndexName: 'patientUsername-index',
        KeyConditionExpression: 'patientUsername = :u',
        ExpressionAttributeValues: { ':u': patientUsername },
      }),
    );
    return (result.Items as Booking[]) || [];
  }

  // Query the providerId-index GSI - now a single Query, since providerId
  // is stored directly on each booking (see create() above) instead of
  // needing a separate doctor lookup per booking to work out which clinic
  // it belongs to.
  async findForProvider(providerId: string): Promise<Booking[]> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.BOOKINGS,
        IndexName: 'providerId-index',
        KeyConditionExpression: 'providerId = :p',
        ExpressionAttributeValues: { ':p': providerId },
      }),
    );
    return (result.Items as Booking[]) || [];
  }

  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const existing = await ddb.send(new GetCommand({ TableName: TABLES.BOOKINGS, Key: { bookingId: id } }));
    if (!existing.Item) throw new NotFoundException(`Booking ${id} not found`);

    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLES.BOOKINGS,
        Key: { bookingId: id },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes as Booking;
  }
}
