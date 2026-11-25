import Transaction from "../models/Transaction.js"
import Stripe from 'stripe'
const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '250 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]


export const getPlans = async (req, res) => {
    try {
        res.json({success: true, plans})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
    
}

export async function getPurchaseStatus(req, res) {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) return res.status(404).json({success: false, message: "Purchase not found"});
    res.json({success: true, isPaid: transaction.isPaid});
}

export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body
        const userId = req.user._id
        const plan = plans.find(plan => plan._id === planId)

        if(!plan){
            return res.json({success:false, message: "Invalid plan"})
        }

        if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({success: false, message: "Checkout is not configured"})
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const transaction = await Transaction.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })
        const origin = new URL(process.env.CLIENT_URL || 'http://localhost:5173').origin;

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: plan.price * 100,
                        product_data :{
                            name: plan.name
                        }

                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/loading?purchase=${transaction._id}`,
            cancel_url: `${origin}`,
            metadata: {transactionId: transaction._id.toString(), appId: 'quickgpt'},
            expires_at: Math.floor(Date.now() / 1000 ) + 30 * 60,
        });
        res.json({success: true, url: session.url})

    } catch (error) {
        res.json({success:false, message: error.message})
    }
    
}