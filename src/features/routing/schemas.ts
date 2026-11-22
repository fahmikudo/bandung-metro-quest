import { z } from 'zod';

export const OperatorIdSchema = z.enum(['MJT', 'TMB', 'ANGKOT']);
export type OperatorId = z.infer<typeof OperatorIdSchema>;

export const ModeFilterSchema = z.enum(['all', 'bus', 'angkot']);
export type ModeFilter = z.infer<typeof ModeFilterSchema>;

export const PassengerTypeSchema = z.enum(['regular', 'discount']);
export type PassengerType = z.infer<typeof PassengerTypeSchema>;

export const TrafficModeSchema = z.enum(['normal', 'rush']);
export type TrafficMode = z.infer<typeof TrafficModeSchema>;

export const CompareModeSchema = z.enum(['motor', 'car']);
export type CompareMode = z.infer<typeof CompareModeSchema>;

export const ActiveTabSchema = z.enum(['planner', 'corridors']);
export type ActiveTab = z.infer<typeof ActiveTabSchema>;

export const OperatorFilterSchema = z.enum(['ALL', 'MJT', 'TMB', 'ANGKOT']);
export type OperatorFilter = z.infer<typeof OperatorFilterSchema>;

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format jam harus HH:MM (WIB)');

export const RouteSearchSchema = z
  .object({
    fromId: z.string().min(1, 'Pilih halte / lokasi keberangkatan'),
    toId: z.string().min(1, 'Pilih halte / lokasi tujuan'),
    modeFilter: ModeFilterSchema.default('all'),
    passengerType: PassengerTypeSchema.default('regular'),
    trafficMode: TrafficModeSchema.default('normal'),
    departureTime: TimeStringSchema.optional(),
  })
  .refine((data) => data.fromId !== data.toId, {
    message: 'Lokasi berangkat dan tujuan harus berbeda',
    path: ['toId'],
  });
export type RouteSearchInput = z.infer<typeof RouteSearchSchema>;

export const ReportTypeSchema = z.enum(['halte', 'tarif', 'jam', 'lainnya']);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportFormSchema = z.object({
  corridorId: z.string().min(1, 'Pilih jalur atau koridor terkait'),
  type: ReportTypeSchema,
  note: z
    .string()
    .trim()
    .min(10, 'Tuliskan catatan minimal 10 karakter agar mudah diverifikasi')
    .max(400, 'Catatan maksimal 400 karakter'),
});
export type ReportFormInput = z.infer<typeof ReportFormSchema>;
