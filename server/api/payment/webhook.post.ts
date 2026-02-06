import { serverSupabaseClient } from '#supabase/server'
// import { snap } from '../../utils/midtrans' // In real app, verify signature

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event) // Service Role client ideal here, but using standard for MVP
    const body = await readBody(event)

    console.log('Received Webhook:', body)

    const orderId = body.order_id
    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

    if (!orderId) return { status: 'ignored' }

    // 1. Determine Status
    let newStatus = 'pending'
    if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
            newStatus = 'challenge'
        } else if (fraudStatus == 'accept') {
            newStatus = 'paid'
        }
    } else if (transactionStatus == 'settlement') {
        newStatus = 'paid'
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        newStatus = 'failed'
    } else if (transactionStatus == 'pending') {
        newStatus = 'pending'
    }

    // 2. Update Transaction
    const { data: transaction } = await client
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single()

    if (!transaction) return { status: 'not_found' }

    // 3. Unlock Content if Paid
    if (newStatus === 'paid') {
        const { error } = await client
            .from('user_purchases')
            .insert({
                user_id: transaction.user_id,
                tryout_id: transaction.tryout_id
            })
            // InitUpsert or Ignore if exists
            .select()

        if (error) console.error('Failed to unlock content:', error)
    }

    return { status: 'ok' }
})
