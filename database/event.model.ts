import mongoose, { Schema, Document, Model } from 'mongoose';
import slugify from 'slugify';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    image: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true },
    audience: { type: String, required: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true },
    tags: { type: [String], required: true },
}, { timestamps: true });

/**
 * Pre-save hook for Slug generation and Date normalization.
 * We remove 'next' from the parameters because this is an 'async' function.
 */
EventSchema.pre<IEvent>('save', async function () {
    // 1. Auto-generate slug from title
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // 2. Normalize the date to ISO format
    if (this.isModified('date')) {
        const parsedDate = new Date(this.date);
        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date format. Please provide a valid date string.');
        }
        this.date = parsedDate.toISOString();
    }

    // NOTE: No next() call here. Mongoose waits for the async function to resolve.
});

export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);