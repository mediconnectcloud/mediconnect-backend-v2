import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { bookings, doctors, providers, slots, Booking, makeBookingId } from '../common/data/seed';

@Injectable()
export class BookingsService {
  // Mirrors the DynamoDB transaction described in the architecture plan:
  // check the slot is still available, mark it booked, then create the
  // booking record. In DynamoDB this becomes a single TransactWriteItems
  // call so the two writes can never happen only halfway.
  create(patientUsername: string, slotId: string): Booking {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.status !== 'available') {
      throw new BadRequestException('Sorry, that slot is no longer available.');
    }

    const doctor = doctors.find((d) => d.id === slot.doctorId);
    const provider = doctor ? providers.find((p) => p.id === doctor.providerId) : undefined;

    slot.status = 'booked';

    const newBooking: Booking = {
      id: makeBookingId(),
      patientUsername,
      doctorId: doctor?.id ?? slot.doctorId,
      doctorName: doctor?.name ?? 'Unknown doctor',
      providerName: provider?.name ?? 'Unknown provider',
      date: slot.date,
      time: slot.time,
      status: 'confirmed',
    };
    bookings.push(newBooking);
    return newBooking;
  }

  findMine(patientUsername: string): Booking[] {
    return bookings.filter((b) => b.patientUsername === patientUsername);
    // Real version (DynamoDB): Query the patientId GSI on the Bookings table.
  }

  findForProvider(providerId: string): Booking[] {
    const providerDoctorIds = doctors.filter((d) => d.providerId === providerId).map((d) => d.id);
    return bookings.filter((b) => providerDoctorIds.includes(b.doctorId));
    // Real version (DynamoDB): Query the providerId GSI on the Bookings table.
  }

  updateStatus(id: string, status: Booking['status']): Booking {
    const found = bookings.find((b) => b.id === id);
    if (!found) throw new NotFoundException(`Booking ${id} not found`);
    found.status = status;
    return found;
  }
}
