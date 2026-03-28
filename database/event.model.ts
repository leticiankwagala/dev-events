import mongoose, { Model, Schema } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;  // stored as YYYY-MM-DD after normalization
  time: string;  // stored as HH:MM (24-hour) after normalization
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Normalizes a time string to "HH:MM" (24-hour format).
 * Accepts "H:MM", "HH:MM", "H:MM AM/PM", "HH:MM AM/PM".
 * Returns null if the input cannot be parsed.
 */
function normalizeTime(raw: string): string | null {
  // 24-hour: "H:MM" or "HH:MM"
  const h24 = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1], 10);
    const m = parseInt(h24[2], 10);
    if (h <= 23 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  // 12-hour: "H:MM AM/PM"
  const h12 = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (h12) {
    let h = parseInt(h12[1], 10);
    const m = parseInt(h12[2], 10);
    const meridiem = h12[3].toUpperCase();
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    if (h <= 23 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return null;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    // Slug is auto-generated from title via pre-save hook; unique index enforced below.
    slug: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
    },
  },
  { timestamps: true }
);

// Unique index on slug for fast lookups and duplicate prevention.
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook:
 * 1. Regenerates slug from title (only when title changes) to keep them in sync.
 * 2. Normalizes `date` to ISO date format (YYYY-MM-DD) and validates it is a real date.
 * 3. Normalizes `time` to HH:MM (24-hour) and rejects unrecognized formats.
 */
EventSchema.pre('save', function (next) {
  // Slug: lowercase, strip special chars, collapse whitespace to hyphens.
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Date: parse and reserialize to guarantee YYYY-MM-DD storage.
  if (this.isModified('date')) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      return next(new Error(`Invalid date value: "${this.date}"`));
    }
    this.date = parsed.toISOString().split('T')[0];
  }

  // Time: normalize to HH:MM (24-hour) regardless of input format.
  if (this.isModified('time')) {
    const normalized = normalizeTime(this.time);
    if (!normalized) {
      return next(
        new Error(
          `Invalid time format: "${this.time}". Expected HH:MM or H:MM AM/PM.`
        )
      );
    }
    this.time = normalized;
  }

  next();
});

// Guard against model re-registration during Next.js hot reloads.
const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>('Event', EventSchema);

export default Event;
