import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export interface ConfirmOptions {
    comment?: string;
}

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (options?: ConfirmOptions) => void;
    totalPrice: number;
    items: { name: string; quantity: number; price: number }[];
    isSubmitting: boolean;
    success?: boolean;
    error?: string | null;
    orderCode?: string;
}

export function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    totalPrice,
    items,
    isSubmitting,
    success,
    error,
    orderCode,
}: ConfirmationDialogProps) {
    // If success or error, we might want to change the content
    const isSuccess = success;
    const isError = !!error;

    const [options, setOptions] = useState<ConfirmOptions>({});

    const handleConfirm = () => {
        onConfirm(options);
        setOptions({});
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isSuccess
                            ? "Bestellung erfolgreich"
                            : isError
                                ? "Bestellung fehlgeschlagen"
                                : "Bestellung bestätigen"}
                    </DialogTitle>
                    <DialogDescription>
                        {isSuccess
                            ? "Bestellung erfolgreich bestätigt."
                            : isError
                                ? "Bestellung fehlgeschlagen."
                                : "Bitte bestätigen Sie Ihre Bestellung."}
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <p className="text-center font-medium">
                            Bestellungscode: <span className="font-bold">{orderCode}</span>
                        </p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                        <p className="text-center text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>
                                    {item.quantity}x {item.name}
                                </span>
                                <span>€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                            <span>Gesamtsumme</span>
                            <span>€{totalPrice.toFixed(2)}</span>
                        </div>
                        <Textarea
                            placeholder="Bemerkung (optional)"
                            className="mt-4"
                            value={options.comment}
                            onChange={(e) => setOptions({ ...options, comment: e.target.value })}
                        />
                    </div>
                )}

                <DialogFooter className="sm:justify-end gap-2">
                    {isSuccess ? (
                        <Button onClick={onClose} className="w-full sm:w-auto">
                            OK
                        </Button>
                    ) : isError ? (
                        <>
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Schließen
                            </Button>
                            <Button onClick={handleConfirm} disabled={isSubmitting}>
                                {isSubmitting ? <Spinner className="mr-2" /> : "Wiederholen"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Abbrechen
                            </Button>
                            <Button onClick={handleConfirm} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="mr-2" /> Bestellen...
                                    </>
                                ) : (
                                    "Bestellen"
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
