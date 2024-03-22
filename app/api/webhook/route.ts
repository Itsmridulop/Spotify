import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/libs/stripe'
import { upsertProductRecord,upsertPriceRecord,manageSubscriptionChange } from '@/libs/supabaseAdmin'

const relevalentEvents = new Set([
    'product.created',
    'product.update',
    'price.created',
    'price.updates',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.created',
    'customer.subscription.deleted'
])

export async function POST(request: Request) {
    const body = await request.text()
    const sig = headers().get('Stripe-Signature')
    const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event: Stripe.Event
    try{
        if(!sig || !webHookSecret) return
        event = stripe.webhooks.constructEvent(body, sig, webHookSecret)
    } catch(error: any){
        console.log(`Error message: ${error.message}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400})
    }
    if(relevalentEvents.has(event.type)){
        try {
            switch(event.type) {
                case 'product.created':
                case 'product.updated':
                    await upsertProductRecord(event.data.object as Stripe.Product)
                    break
                case 'price.created':
                case 'price.updated':
                    await upsertPriceRecord(event.data.object as Stripe.Price)
                    break
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = event.data.object as Stripe.Subscription
                    await manageSubscriptionChange(
                        subscription.id,
                        subscription.customer as string,
                        event.type ===  'customer.subscription.created'
                    )
                    break
                case 'checkout.session.completed':
                    const checkoutSession = event.data.object as Stripe.Checkout.Session
                    if(checkoutSession.mode === 'subscription') {
                        const subscriptionId = checkoutSession.subscription
                        await manageSubscriptionChange(
                            subscriptionId as string,
                            checkoutSession.customer as string,
                            true
                        )
                    }
                    break
                default: throw new Error('unhandled relevent event!')
            }
        } catch (error) {
            console.log(error)
            return new NextResponse(`webhook error`, { status: 400})
        }
    }
    return NextResponse.json({receive: true}, {status: 200})
}
