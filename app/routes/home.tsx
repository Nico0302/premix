import { useState } from "react";
import type { Route } from "./+types/home";
import { fetchItems, fetchQuotas, createOrder, type PretixItem, type PretixQuota } from "~/lib/pretix";
import { TicketCard } from "~/components/ticket-card";
import { PurchaseBar } from "~/components/purchase-bar";
import { ConfirmationDialog, type ConfirmOptions } from "~/components/confirmation-dialog";
import { redirect, useSubmit, useNavigation, useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Ticket Backoffice" },
        { name: "description", content: "Purchase tickets" },
    ];
}

export async function loader({ }: Route.LoaderArgs) {
    const [items, quotas] = await Promise.all([fetchItems(), fetchQuotas()]);
    return { items, quotas };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const positionsJson = formData.get("positions") as string;
    const email = process.env.PRETIX_EMAIL;

    if (!email) {
        return { error: "No email configured" };
    }

    if (!positionsJson) {
        return { error: "No items selected" };
    }

    try {
        const positions = JSON.parse(positionsJson);
        const order = await createOrder(positions, email, formData.get("comment") as string);
        return { success: true, orderCode: order.code };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create order" };
    }
}

export default function Backoffice({ loaderData, actionData }: Route.ComponentProps) {
    const { items, quotas } = loaderData;
    const [quantities, setQuantities] = useState<{ [itemId: number]: number }>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const submit = useSubmit();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";


    const handleQuantityChange = (itemId: number, quantity: number) => {
        setQuantities((prev) => ({
            ...prev,
            [itemId]: quantity,
        }));
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const qty = quantities[item.id] || 0;
            return total + parseFloat(item.default_price) * qty;
        }, 0);
    };

    const getSelectedItems = () => {
        return items
            .filter((item) => (quantities[item.id] || 0) > 0)
            .map((item) => ({
                name: item.name.de || "Ticket",
                quantity: quantities[item.id] || 0,
                price: parseFloat(item.default_price),
                id: item.id,
            }));
    };

    const totalPrice = calculateTotal();
    const selectedItems = getSelectedItems();
    const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleConfirmPurchase = (options?: ConfirmOptions) => {
        const positions = selectedItems.map(i => ({ item: i.id, price: i.price.toFixed(2) }));
        submit({ positions: JSON.stringify(positions), comment: options?.comment ?? "" }, { method: "post" });
        // Dialog stays open to show loading/result
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        // If success, we should clear quantities
        if (actionData?.success) {
            setQuantities({});
            navigate(".", { replace: true });
        } else if (actionData?.error) {
            navigate(".", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="bg-card border-b p-4 sticky top-0 z-10">
                <div className="container max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold">Ticket Backoffice</h1>
                </div>
            </header>

            <main className="container max-w-3xl mx-auto p-4 space-y-4">
                {/* Alerts removed, handled in dialog */}

                {items.filter((item) => quotas.find((q) => q.items.includes(item.id))?.available).map((item) => {
                    // Find relevant quota
                    const itemQuota = quotas.find((q) => q.items.includes(item.id));

                    return (
                        <TicketCard
                            key={item.id}
                            item={item}
                            quota={itemQuota}
                            quantity={quantities[item.id] || 0}
                            onQuantityChange={(q) => handleQuantityChange(item.id, q)}
                        />
                    );
                })}
            </main>

            <PurchaseBar
                totalPrice={totalPrice}
                itemCount={totalQuantity}
                onPurchase={() => setIsDialogOpen(true)}
            />

            <ConfirmationDialog
                open={isDialogOpen || !!actionData}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmPurchase}
                totalPrice={totalPrice}
                items={selectedItems}
                isSubmitting={isSubmitting} // In Remix, use navigation.state === "submitting"
                success={actionData?.success}
                error={actionData?.error}
                orderCode={actionData?.orderCode}
            />
        </div>
    );
}
