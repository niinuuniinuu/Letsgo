import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const attemptId = getRouterParam(event, 'id')

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 1. Fetch Attempt Details
    const { data: attempt, error: attemptError } = await client
        .from('student_exams')
        .select('*, tryouts(title, scoring_type)')
        .eq('id', attemptId)
        .eq('student_id', user.id) // Security: Ensure user owns the attempt
        .single()

    if (attemptError || !attempt) {
        throw createError({ statusCode: 404, message: 'Result not found' })
    }

    // 2. Fetch Detailed Answers
    const { data: answers, error: answersError } = await client
        .from('answers')
        .select(`
      *,
      questions (
        id,
        content,
        options,
        correct_answer,
        irt_weight,
        category
      )
    `)
        .eq('student_exam_id', attemptId)

    if (answersError) {
        throw createError({ statusCode: 500, message: 'Failed to fetch answers' })
    }

    return {
        attempt,
        answers: answers.map(a => ({
            ...a,
            question: a.questions // Flattens the structure slightly for frontend convenience
        }))
    }
})
