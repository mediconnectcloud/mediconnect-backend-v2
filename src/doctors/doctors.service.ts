import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../common/dynamodb/dynamodb.client';

export interface Doctor {
  providerId: string;
  doctorId: string;
  name: string;
  specialization?: string;
  fee?: number;
}

function makeDoctorId(): string {
  return `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class DoctorsService {
  // Query on the table's own partition key (providerId) - the fast,
  // designed-for path: "all doctors at this clinic".
  async findByProvider(providerId: string): Promise<Doctor[]> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.DOCTORS,
        KeyConditionExpression: 'providerId = :providerId',
        ExpressionAttributeValues: { ':providerId': providerId },
      }),
    );
    return (result.Items as Doctor[]) || [];
  }

  // No providerId known here - go through the doctorId-index GSI instead.
  async findOne(id: string): Promise<Doctor> {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLES.DOCTORS,
        IndexName: 'doctorId-index',
        KeyConditionExpression: 'doctorId = :doctorId',
        ExpressionAttributeValues: { ':doctorId': id },
      }),
    );
    const item = result.Items?.[0] as Doctor | undefined;
    if (!item) throw new NotFoundException(`Doctor ${id} not found`);
    return item;
  }

  async create(providerId: string, data: { name: string; specialization?: string; fee?: number }): Promise<Doctor> {
    const newDoctor: Doctor = {
      providerId,
      doctorId: makeDoctorId(),
      name: data.name,
      specialization: data.specialization || '',
      fee: data.fee ?? 0,
    };
    await ddb.send(new PutCommand({ TableName: TABLES.DOCTORS, Item: newDoctor }));
    return newDoctor;
  }

  async remove(id: string): Promise<{ success: true }> {
    // DeleteCommand needs the FULL primary key (providerId + doctorId),
    // but the route only gives us doctorId - so look the doctor up first
    // (via the same GSI as findOne) to get the providerId needed to delete it.
    const doctor = await this.findOne(id);
    await ddb.send(
      new DeleteCommand({
        TableName: TABLES.DOCTORS,
        Key: { providerId: doctor.providerId, doctorId: doctor.doctorId },
      }),
    );
    return { success: true };
  }
}
