import { User, UserPlan } from '../types';
import { dbService } from './database';

interface CheckoutResponse {
    success: boolean;
    message: string;
}

export const processPayment = async (
    user: User, 
    plan: UserPlan, 
    method: 'pix' | 'credit_card'
): Promise<CheckoutResponse> => {
    
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Pricing Logic - Weekly Subscription
    const prices = {
        free: 0,
        pro: 47.00 // Weekly Price
    };

    if (plan === 'free') return { success: true, message: "Plano Gratuito mantido." };

    const amount = prices[plan];

    // Here we would normally call the Mercado Pago API to create a preference
    // and wait for the webhook. Since we are client-side only for this demo,
    // we simulate a successful transaction.

    try {
        // 1. Register Transaction in "Backend"
        dbService.createTransaction({
            id: `tx_${Date.now()}`,
            userId: user.id,
            userName: user.name,
            amount: amount,
            planPurchased: plan,
            status: 'approved',
            method: method,
            date: new Date().toISOString()
        });

        // 2. The DB service 'createTransaction' automatically handles the User Plan upgrade logic
        // if the status is approved. Update logic for weekly duration (7 days) in database service is default or handled here logicly
        // Note: The dbService.updateUserPlan default is 30 days, but for this weekly model we conceptually treat it as active.
        // In a real backend, we would set the expiration to Date.now() + 7 days.

        return { 
            success: true, 
            message: `Assinatura Semanal de R$ ${amount.toFixed(2)} ativada! Bem-vindo ao VIP.` 
        };

    } catch (error) {
        console.error("Payment Error", error);
        return { success: false, message: "Falha ao processar pagamento. Tente novamente." };
    }
};