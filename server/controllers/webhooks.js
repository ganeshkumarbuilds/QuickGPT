import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export async function stripeWebhooks(req, res) {
    const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return res.sendStatus(503);
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET
        );
    } catch {
        return res.status(400).send("Invalid webhook signature");
    }
    let session;
    if (event.type === "payment_intent.succeeded") {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: event.data.object.id, limit: 1 });
        session = sessions.data[0];
    } else if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
        session = event.data.object;
    }
    if (session?.metadata?.appId === "quickgpt" && session.payment_status === "paid") {
        const transaction = await Transaction.findById(session.metadata.transactionId);
        if (!transaction) return res.status(404).send("Unknown purchase");
        if (session.currency !== "usd" || session.amount_total !== transaction.amount * 100) {
            return res.status(400).send("Purchase amount mismatch");
        }
        if (!transaction.isPaid) {
            // The receipt and increment share one atomic write, even on standalone MongoDB.
            const result = await User.updateOne(
                { _id: transaction.userId, creditedTransactions: { $ne: transaction._id } },
                { $inc: { credits: transaction.credits }, $addToSet: { creditedTransactions: transaction._id } }
            );
            if (!result.matchedCount && !await User.exists({ _id: transaction.userId, creditedTransactions: transaction._id })) {
                return res.status(500).send("Purchaser unavailable");
            }
            await Transaction.updateOne({ _id: transaction._id }, { $set: { isPaid: true } });
        }
    }
    res.json({ received: true });
}
