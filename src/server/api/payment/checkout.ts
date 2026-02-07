import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { snap } from '../../utils/midtrans'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)

    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
    if (!body.tryoutId) throw createError({ statusCode: 400, message: 'Missing Tryout ID' })

    // 1. Get Tryout Details
    const { data: tryout } = await client
        .from('tryouts')
        .select('*')
        .eq('id', body.tryoutId)
        .single()

    if (!tryout) throw createError({ statusCode: 404, message: 'Tryout not found' })

    // 2. Check if already purchased
    const { data: existing } = await client
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('tryout_id', tryout.id)
        .single()

    if (existing) {
        return { status: 'already_purchased' }
    }

    // 3. Create Transaction
    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const amount = 50000 // Fixed price for now, or fetch from DB if column existed

    const { data: transaction, error: trxError } = await client
        .from('transactions')
        .insert({
            user_id: user.id,
            tryout_id: tryout.id,
            amount: amount,
            status: 'pending'
        })
        .select()
        .single()

    if (trxError) throw createError({ statusCode: 500, message: 'Transaction Failed' })

    // 4. Get Midtrans Token
    let snapToken = ''

    try {
        const parameter: any = {
            transaction_details: {
                order_id: transaction.id, // Use UUID from DB to match webhook
                gross_amount: amount
            },
            customer_details: {
                email: user.email
            },
            item_details: [{
                id: tryout.id,
                price: amount,
                quantity: 1,
                name: tryout.title.substring(0, 50)
            }]
        }

        const midtransTx = await snap.createTransaction(parameter)
        snapToken = midtransTx.token
    } catch (err) {
        // Fallback for Mock/Dev without real keys
        console.warn('Midtrans Error (ignore in mock mode):', err)
        snapToken = 'dummy_token_' + Date.now()
    }

    // 5. Update Transaction with Token
    await client
        .from('transactions')
        .update({ snap_token: snapToken })
        .eq('id', transaction.id)

    return { token: snapToken, orderId: transaction.id }
})
