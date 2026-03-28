export type EventItem = {
    image: string;
    title: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

export const events: EventItem[] = [
    {
        image: "/images/event1.png",
        title: "React Summit US 2025",
        slug: "react-summit-2025",
        location: "San Francisco, CA, USA",
        date: "2025-11-07",
        time: "09:00am",
    },
    {
        image: "/images/event2.png",
        title: "Next.js Conf 2026",
        slug: "nextjs-conf-2026",
        location: "New York City, NY, USA",
        date: "2026-05-15",
        time: "10:00am",
    },
    {
        image: "/images/event3.png",
        title: "DevFest Kampala 2026",
        slug: "devfest-kampala-2026",
        location: "Kampala, Uganda",
        date: "2026-12-12",
        time: "08:30am",
    },
    {
        image: "/images/event4.png",
        title: "Config by Figma",
        slug: "config-figma-2026",
        location: "San Francisco, CA, USA",
        date: "2026-06-20",
        time: "09:00am",
    },
    {
        image: "/images/event5.png",
        title: "TypeScript Global Meetup",
        slug: "typescript-global-2026",
        location: "Remote / Online",
        date: "2026-08-05",
        time: "04:00pm",
    },
    {
        image: "/images/event6.png",
        title: "JavaScript Global Meetup",
        slug: "javascript-global-2026",
        location: "Nairobi, Kenya",
        date: "2026-09-11",
        time: "08:00am",
    }
];

