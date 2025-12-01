import type { PretixItem, PretixQuota } from "~/lib/pretix";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";

interface TicketCardProps {
    item: PretixItem;
    quota: PretixQuota | undefined;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
}

export function TicketCard({ item, quota, quantity, onQuantityChange }: TicketCardProps) {
    const price = parseFloat(item.default_price);
    const available = quota?.available_number ?? null;
    const isAvailable = quota?.available ?? false;

    // Generate quantity options (0 to 24, but limited by availability if known)
    const maxQuantity = available !== null ? Math.min(24, available) : 24;
    const options = Array.from({ length: maxQuantity + 1 }, (_, i) => i);

    return (
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            {/* Image */}
            <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-md overflow-hidden">
                {item.picture ? (
                    <img
                        src={item.picture}
                        alt={item.name.de || "Ticket"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                    </div>
                )}
            </div>

            {/* Details */}
            <CardContent className="flex-grow min-w-0 p-0">
                <h3 className="font-semibold text-lg leading-tight">
                    {item.name.de || "Unnamed Ticket"}
                </h3>
                {item.description?.de && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.description.de}
                    </p>
                )}
                <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="font-medium">€{price.toFixed(2)}</span>
                    {available !== null ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${available > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {available} übrig
                        </span>
                    ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            Verfügbar
                        </span>
                    )}
                </div>
            </CardContent>

            {/* Quantity Selector */}
            <CardFooter className="flex-shrink-0 p-0">
                <div className="w-20">
                    <NativeSelect
                        value={quantity}
                        onChange={(e) => onQuantityChange(parseInt(e.target.value, 10))}
                        disabled={!isAvailable && available !== null && available <= 0}
                        aria-label="Select quantity"
                    >
                        {options.map((opt) => (
                            <NativeSelectOption key={opt} value={opt}>
                                {opt}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </div>
            </CardFooter>
        </Card>
    );
}
