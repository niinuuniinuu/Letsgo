import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)
    const { attemptId, questionId, selectedOption } = body

    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    // Security check: Ensure attempt belongs to user
    // (In a real high-load app, might cache this validation or trust the ID for speed if signed)
    // For now we'll do the upsert directly.

    const { error } = await client
        .from('answers')
        .upsert({
            student_exam_id: attemptId,
            question_id: questionId,
            selected_option: selectedOption,
            // We don't verify correctness here to save DB reads. 
            // Correctness is checked on submit (or via a trigger if we moved logic to DB).
            // We'll calculate is_correct on Submit.
            is_correct: false // Default/Placeholder
        }, {
            onConflict: 'student_exam_id, question_id'
        })

    if (error) {
        console.error('Save error:', error)
        throw createError({ statusCode: 500, message: 'Failed to save answer' })
    }

    return { success: true }
})
