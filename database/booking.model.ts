import mongoose, { Model, Schema, Types, Document } from 'mongoose';

/**
 * Interface for the Booking document.
 * Using 'extends Document' ensures Mongoose methods are available on the object.
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// RFC 5322-inspired regex for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * Verifies the existence of the referenced Event.
 * Note: No 'next' argument is used here to avoid "next is not a function" errors
 * in Next.js async middleware.
 */
BookingSchema.pre<IBooking>('save', async function () {
  // Use .exists() for a lightweight check to save database resources
  const eventExists = await mongoose.model('Event').exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error(
        `Cannot create booking: Event with id "${this.eventId}" does not exist.`
    );
  }
});

/**
 * Model Export:
 * Includes a guard against model re-registration during Next.js Hot Module Replacement (HMR).
 */
const Booking: Model<IBooking> =
    (mongoose.models.Booking as Model<IBooking>) ||
    mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;