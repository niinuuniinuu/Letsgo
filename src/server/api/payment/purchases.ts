import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) return []

    const { data } = await client
        .from('user_purchases')
        .select('tryout_id')
        .eq('user_id', user.id)

    return data?.map(p => p.tryout_id) || []
})
