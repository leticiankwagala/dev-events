import mongoose, { Model, Schema, Types } from 'mongoose';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// RFC 5322-inspired regex: covers the vast majority of valid email formats.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking schema.
 * - eventId is indexed for efficient queries by event (e.g. "all bookings for event X").
 * - email is lowercased on save so lookups are case-insensitive by default.
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: (props: { value: string }) =>
          `"${props.value}" is not a valid email address.`,
      },
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook:
 * Verifies that the referenced `eventId` corresponds to an existing Event document.
 * Throws early to prevent orphaned bookings from being persisted.
 */
BookingSchema.pre('save', async function () {
  // Use exists() for a lightweight existence check (no full document fetch).
  const eventExists = await mongoose
    .model('Event')
    .exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error(
      `Cannot create booking: Event with id "${this.eventId}" does not exist.`
    );
  }
});

// Guard against model re-registration during Next.js hot reloads.
const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
