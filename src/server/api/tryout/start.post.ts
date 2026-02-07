import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)
    const { tryoutId } = body

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 1. Check for existing in_progress attempt
    const { data: existingAttempt } = await client
        .from('student_exams')
        .select('id, finished_at, created_at')
        .eq('student_id', user.id)
        .eq('tryout_id', tryoutId)
        .eq('status', 'in_progress')
        .single()

    if (existingAttempt) {
        // Fetch saved answers for this attempt
        const { data: savedAnswers } = await client
            .from('answers')
            .select('question_id, selected_option')
            .eq('student_exam_id', existingAttempt.id)

        // Convert array to map for frontend
        const answerMap = savedAnswers?.reduce((acc, curr) => {
            acc[curr.question_id] = curr.selected_option
            return acc
        }, {} as Record<string, string>)

        return {
            attemptId: existingAttempt.id,
            existingAnswers: answerMap || {},
            isResumed: true
        }
    }

    // 2. Create new attempt
    const { data: newAttempt, error } = await client
        .from('student_exams')
        .insert({
            student_id: user.id,
            tryout_id: tryoutId,
            status: 'in_progress'
        })
        .select()
        .single()

    if (error) throw createError({ statusCode: 500, message: 'Failed to start exam' })

    return {
        attemptId: newAttempt.id,
        existingAnswers: {},
        isResumed: false
    }
})
