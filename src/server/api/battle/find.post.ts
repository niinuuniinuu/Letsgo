import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)

    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    // 1. Try to find a waiting match
    const { data: waitingMatch } = await client
        .from('matches')
        .select('*')
        .eq('status', 'waiting')
        .neq('player1_id', user.id) // Don't match with self
        .limit(1)
        .single()

    if (waitingMatch) {
        // Join existing match
        const { data: updatedMatch, error } = await client
            .from('matches')
            .update({
                player2_id: user.id,
                status: 'playing'
            })
            .eq('id', waitingMatch.id)
            .select()
            .single()

        if (error) throw createError({ statusCode: 500, message: 'Failed to join match' })

        return {
            matchId: updatedMatch.id,
            role: 'p2',
            status: 'playing'
        }
    } else {
        // Create new match
        // For MVP, we'll just pick the first active tryout or use the one passed in body
        // effective tryout_id is needed.
        let tryoutId = body.tryoutId

        if (!tryoutId) {
            const { data: anyTryout } = await client
                .from('tryouts')
                .select('id')
                .limit(1)
                .single()
            tryoutId = anyTryout?.id
        }

        if (!tryoutId) throw createError({ statusCode: 400, message: 'No Tryout Available' })

        const { data: newMatch, error } = await client
            .from('matches')
            .insert({
                player1_id: user.id,
                tryout_id: tryoutId,
                status: 'waiting',
                scores: { p1: 0, p2: 0 }
            })
            .select()
            .single()

        if (error) throw createError({ statusCode: 500, message: 'Failed to create match' })

        return {
            matchId: newMatch.id,
            role: 'p1',
            status: 'waiting'
        }
    }
})
