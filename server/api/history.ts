import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const { data: history, error } = await client
        .from('student_exams')
        .select('*, tryouts(title)')
        .eq('student_id', user.id)
        .eq('status', 'finished')
        .order('finished_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to fetch history' })
    }

    return history
})
