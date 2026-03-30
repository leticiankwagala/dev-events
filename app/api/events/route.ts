import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const eventData = Object.fromEntries(formData.entries());

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'DevEvent' },
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            ).end(buffer);
        });

        eventData.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create(eventData);

        return NextResponse.json({
            message: 'Successfully created',
            event: createdEvent
        }, { status: 201 });

    } catch (e) {
        console.error("Cloudinary/DB Error:", e);
        return NextResponse.json({
            message: 'Event Creation Failed',
            error: e instanceof Error ? e.message : 'Unknown'
        }, { status: 500 });
    }
}

export async function GET() {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event Fetched Successfully', events }, { status: 200});
    }catch(e){
        return NextResponse.json({ message: 'Event Fetching Failed', error: e }, {status: 500});
    }
}