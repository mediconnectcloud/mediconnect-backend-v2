import { Injectable, NotFoundException } from '@nestjs/common';
import { doctors, Doctor, makeDoctorId } from '../common/data/seed';

@Injectable()
export class DoctorsService {
  findByProvider(providerId: string): Doctor[] {
    return doctors.filter((d) => d.providerId === providerId);
  }

  findOne(id: string): Doctor {
    const found = doctors.find((d) => d.id === id);
    if (!found) throw new NotFoundException(`Doctor ${id} not found`);
    return found;
  }

  create(providerId: string, data: { name: string; specialization?: string; fee?: number }): Doctor {
    const newDoctor: Doctor = {
      id: makeDoctorId(),
      providerId,
      name: data.name,
      specialization: data.specialization || '',
      fee: data.fee ?? 0,
    };
    doctors.push(newDoctor);
    return newDoctor;
  }

  remove(id: string): { success: true } {
    const index = doctors.findIndex((d) => d.id === id);
    if (index === -1) throw new NotFoundException(`Doctor ${id} not found`);
    doctors.splice(index, 1);
    return { success: true };
  }
}
