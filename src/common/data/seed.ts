// This file is a stand-in for DynamoDB. Everything here lives only in
// memory (resets on server restart), so the app can be built and demoed
// end-to-end before AWS is connected.
//
// The shape of each record matches the DynamoDB table design from the
// architecture plan (Users, Providers, Facilities, Doctors, Slots,
// Bookings, Notifications) so swapping this for real DynamoDB calls later
// is a data-access change only, not a redesign.

export interface Provider {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Doctor {
  id: string;
  providerId: string;
  name: string;
  specialization: string;
  fee: number;
}

export interface Slot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'available' | 'booked' | 'blocked';
}

export interface Booking {
  id: string;
  patientUsername: string;
  doctorId: string;
  doctorName: string;
  providerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}

export const providers: Provider[] = [
  {
    id: 'PRV-101',
    name: 'Hamilton East Health Centre',
    type: 'Clinic',
    city: 'Hamilton',
    address: '12 Grey Street, Hamilton East',
    phone: '07 855 1234',
    hours: 'Mon-Fri 8:00am - 6:00pm',
    status: 'approved',
  },
  {
    id: 'PRV-102',
    name: 'Waikato Family Dental',
    type: 'Dental',
    city: 'Hamilton',
    address: '45 Anglesea Street, Hamilton Central',
    phone: '07 839 4455',
    hours: 'Mon-Sat 9:00am - 5:00pm',
    status: 'approved',
  },
  {
    id: 'PRV-103',
    name: 'Chartwell Physiotherapy',
    type: 'Physiotherapy',
    city: 'Hamilton',
    address: '8 Comries Road, Chartwell',
    phone: '07 855 7788',
    hours: 'Mon-Fri 7:30am - 7:00pm',
    status: 'approved',
  },
  {
    id: 'PRV-104',
    name: 'Auckland City Medical',
    type: 'Clinic',
    city: 'Auckland',
    address: '22 Queen Street, Auckland Central',
    phone: '09 300 1122',
    hours: 'Mon-Fri 8:00am - 8:00pm',
    status: 'approved',
  },
  {
    id: 'PRV-105',
    name: 'Newtown Wellness Clinic',
    type: 'Clinic',
    city: 'Wellington',
    address: '5 Riddiford Street, Newtown',
    phone: '04 389 6677',
    hours: 'Mon-Fri 8:30am - 5:30pm',
    status: 'pending',
  },
];

export const doctors: Doctor[] = [
  { id: 'DOC-12', providerId: 'PRV-101', name: 'Dr. Sarah Lee', specialization: 'General Practice', fee: 55 },
  { id: 'DOC-13', providerId: 'PRV-101', name: 'Dr. Amit Verma', specialization: 'General Practice', fee: 55 },
  { id: 'DOC-14', providerId: 'PRV-102', name: 'Dr. Grace Wilson', specialization: 'Dentistry', fee: 90 },
  { id: 'DOC-15', providerId: 'PRV-103', name: 'Dr. Noah Campbell', specialization: 'Physiotherapy', fee: 70 },
  { id: 'DOC-16', providerId: 'PRV-104', name: 'Dr. Priya Nair', specialization: 'General Practice', fee: 60 },
  { id: 'DOC-17', providerId: 'PRV-105', name: 'Dr. Arya Singh', specialization: 'Cardiologist', fee: 100},
];

export const slots: Slot[] = [
  { id: 'SLT-1', doctorId: 'DOC-12', date: '2026-08-03', time: '09:00', status: 'available' },
  { id: 'SLT-2', doctorId: 'DOC-12', date: '2026-08-03', time: '09:20', status: 'available' },
  { id: 'SLT-3', doctorId: 'DOC-12', date: '2026-08-03', time: '09:40', status: 'booked' },
  { id: 'SLT-4', doctorId: 'DOC-12', date: '2026-08-04', time: '10:00', status: 'available' },
  { id: 'SLT-5', doctorId: 'DOC-13', date: '2026-08-03', time: '11:00', status: 'available' },
  { id: 'SLT-6', doctorId: 'DOC-14', date: '2026-08-05', time: '14:00', status: 'available' },
  { id: 'SLT-7', doctorId: 'DOC-14', date: '2026-08-05', time: '14:30', status: 'available' },
  { id: 'SLT-8', doctorId: 'DOC-15', date: '2026-08-04', time: '15:00', status: 'available' },
  { id: 'SLT-9', doctorId: 'DOC-16', date: '2026-08-06', time: '09:30', status: 'available' },
];

export const bookings: Booking[] = [
  {
    id: 'BKG-9001',
    patientUsername: 'patient',
    doctorId: 'DOC-12',
    doctorName: 'Dr. Sarah Lee',
    providerName: 'Hamilton East Health Centre',
    date: '2026-08-03',
    time: '09:40',
    status: 'confirmed',
  },
];

let nextDoctorId = 1000;
let nextSlotId = 10;
let nextBookingId = 9002;

export function makeDoctorId(): string {
  return `DOC-${nextDoctorId++}`;
}
export function makeSlotId(): string {
  return `SLT-${nextSlotId++}`;
}
export function makeBookingId(): string {
  return `BKG-${nextBookingId++}`;
}
