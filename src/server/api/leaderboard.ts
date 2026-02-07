import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const tryoutId = query.tryoutId as string

    if (!tryoutId) {
        return []
    }

    const { data, error } = await client
        .from('student_exams')
        .select(`
      weighted_score,
      max_score: weighted_score,
      finished_at,
      profiles:student_id (
        full_name,
        school
      )
    `)
        .eq('tryout_id', tryoutId)
        .eq('status', 'finished')
        .order('weighted_score', { ascending: false })
        .limit(50)

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    // Transform data to flatten the profile structure
    return data.map((entry: any, index: number) => ({
        rank: index + 1,
        name: entry.profiles?.full_name || 'Anonymous',
        school: entry.profiles?.school || '-',
        score: Math.round(entry.weighted_score || 0),
        date: entry.finished_at
    }))
})
