import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { calculateIRTScore } from '~/core/irt-engine'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)

    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const { attemptId, tryoutId } = body

    // 1. Fetch Questions for Key (Correct Answer & Weights)
    const { data: questions } = await client
        .from('questions')
        .select('id, correct_answer, irt_weight')
        .eq('tryout_id', tryoutId)

    if (!questions) throw createError({ statusCode: 500, message: 'Questions not found' })

    // 2. Fetch User's Saved Answers from DB
    const { data: savedAnswers } = await client
        .from('answers')
        .select('question_id, selected_option')
        .eq('student_exam_id', attemptId)

    // 3. Score Calculation
    const engineQuestions = questions.map(q => ({
        id: q.id,
        weight: Number(q.irt_weight),
        correctAnswer: q.correct_answer
    }))

    const userAnswers = savedAnswers?.map(a => ({
        questionId: a.question_id,
        selectedOption: a.selected_option
    })) || []

    // Check correctness for DB update
    const correctnessUpdates = userAnswers.map(a => {
        const q = questions.find(q => q.id === a.questionId)
        return {
            student_exam_id: attemptId,
            question_id: a.questionId,
            selected_option: a.selectedOption,
            is_correct: q ? q.correct_answer === a.selectedOption : false
        }
    })

    // Update correctness in DB (Optional optimization: do this in background or trigger)
    if (correctnessUpdates.length > 0) {
        await client.from('answers').upsert(correctnessUpdates)
    }

    const scoreResult = calculateIRTScore(engineQuestions, userAnswers)

    // 4. Update Attempt Status
    const { error: updateError } = await client
        .from('student_exams')
        .update({
            status: 'finished',
            finished_at: new Date().toISOString(),
            raw_score: scoreResult.rawScore,
            weighted_score: scoreResult.weightedScore
        })
        .eq('id', attemptId)

    if (updateError) throw createError({ statusCode: 500, message: 'Failed to finish exam' })

    return {
        success: true,
        score: scoreResult.weightedScore,
        attemptId: attemptId
    }
})
