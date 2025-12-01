import { redirect } from "react-router";

const PRETIX_API_URL = process.env.PRETIX_API_URL;
const PRETIX_API_TOKEN = process.env.PRETIX_API_TOKEN;
const ORGANIZER_SLUG = process.env.PRETIX_ORGANIZER_SLUG;
const EVENT_SLUG = process.env.PRETIX_EVENT_SLUG;

if (!PRETIX_API_URL || !PRETIX_API_TOKEN || !ORGANIZER_SLUG || !EVENT_SLUG) {
    throw new Error("Missing Pretix environment variables");
}

const HEADERS = {
    Authorization: `Token ${PRETIX_API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
};

export interface PretixItem {
    id: number;
    name: { [lang: string]: string };
    description: { [lang: string]: string } | null;
    default_price: string;
    picture: string | null;
    active: boolean;
    position: number;
    available_from: string | null;
    available_until: string | null;
    variations?: PretixVariation[];
}

export interface PretixVariation {
    id: number;
    value: { [lang: string]: string };
    default_price: string | null;
    price: string;
    active: boolean;
    position: number;
}

export interface PretixQuota {
    id: number;
    name: string;
    size: number | null;
    items: number[];
    variations: number[];
    available: boolean;
    available_number: number | null;
}

export async function fetchItems(): Promise<PretixItem[]> {
    const url = `${PRETIX_API_URL}/organizers/${ORGANIZER_SLUG}/events/${EVENT_SLUG}/items/?active=true`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
        throw new Error(`Failed to fetch items: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results;
}

export async function fetchQuotas(): Promise<PretixQuota[]> {
    const url = `${PRETIX_API_URL}/organizers/${ORGANIZER_SLUG}/events/${EVENT_SLUG}/quotas/?with_availability=true`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
        throw new Error(`Failed to fetch quotas: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results;
}

export interface OrderPosition {
    item: number;
    variation?: number;
    price: string;
}

export interface CreateOrderPayload {
    locale: string;
    positions: OrderPosition[];
    email: string;
    status?: "n" | "p"; // pending or paid
    payment_provider?: string;
    comment?: string;
}

export async function createOrder(positions: OrderPosition[], email: string, comment?: string) {
    const url = `${PRETIX_API_URL}/organizers/${ORGANIZER_SLUG}/events/${EVENT_SLUG}/orders/`;

    const payload: CreateOrderPayload = {
        locale: "de", // Default to en for now
        positions,
        email,
        status: "p", // Create as pending
        payment_provider: "manual",
        comment: "Created via backoffice\n" + (comment ?? ""),
    };

    const res = await fetch(url, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Order creation failed:", errorText);
        throw new Error(`Failed to create order: ${res.statusText} - ${errorText}`);
    }

    return await res.json();
}
