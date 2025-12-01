import { Button } from "./ui/button";

interface PurchaseBarProps {
    totalPrice: number;
    itemCount: number;
    onPurchase: () => void;
    disabled?: boolean;
}

export function PurchaseBar({ totalPrice, itemCount, onPurchase, disabled }: PurchaseBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg z-10">
            <div className="container max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Gesammtsumme</span>
                    <span className="text-2xl font-bold">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        {itemCount} tickets ausgewählt
                    </span>
                    <Button
                        size="lg"
                        onClick={onPurchase}
                        disabled={disabled || itemCount === 0}
                    >
                        Kaufen
                    </Button>
                </div>
            </div>
        </div>
    );
}
