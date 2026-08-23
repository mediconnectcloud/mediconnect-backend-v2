import { Injectable, NotFoundException } from '@nestjs/common';
import { slots, Slot, makeSlotId } from '../common/data/seed';

@Injectable()
export class SlotsService {
  findByDoctor(doctorId: string): Slot[] {
    return slots
      .filter((s) => s.doctorId === doctorId)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    // Real version (DynamoDB): Query on partition key doctorId, sort key
    // dateTime - this is the exact access pattern the Slots table was
    // designed for in the architecture plan.
  }

  create(doctorId: string, data: { date: string; time: string }): Slot {
    const newSlot: Slot = {
      id: makeSlotId(),
      doctorId,
      date: data.date,
      time: data.time,
      status: 'available',
    };
    slots.push(newSlot);
    return newSlot;
  }

  updateStatus(id: string, status: Slot['status']): Slot {
    const found = slots.find((s) => s.id === id);
    if (!found) throw new NotFoundException(`Slot ${id} not found`);
    found.status = status;
    return found;
  }

  findOne(id: string): Slot {
    const found = slots.find((s) => s.id === id);
    if (!found) throw new NotFoundException(`Slot ${id} not found`);
    return found;
  }
}
