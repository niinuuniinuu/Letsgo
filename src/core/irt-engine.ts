/**
 * IRT (Item Response Theory) Scoring Engine (Pure TypeScript)
 * This logic is framework-agnostic and can be ported to any JS/TS environment.
 */

export interface Question {
    id: string;
    weight: number; // IRT difficulty/discrimination weight
    correctAnswer: string;
}

export interface UserAnswer {
    questionId: string;
    selectedOption: string;
}

export interface ScoreResult {
    rawScore: number;
    weightedScore: number;
    totalQuestions: number;
    correctCount: number;
}

/**
 * Calculates the score based on a simple weighted IRT model.
 * In a real-world scenario, this would involve more complex probability 
 * estimation, but this serves as a solid foundation for early stages.
 */
export function calculateIRTScore(
    questions: Question[],
    userAnswers: UserAnswer[]
): ScoreResult {
    let correctCount = 0;
    let weightedScore = 0;
    let maxPossibleWeightedScore = 0;

    const answerMap = new Map(userAnswers.map(a => [a.questionId, a.selectedOption]));

    questions.forEach(q => {
        maxPossibleWeightedScore += q.weight;
        const userOption = answerMap.get(q.id);

        if (userOption === q.correctAnswer) {
            correctCount++;
            weightedScore += q.weight;
        }
    });

    // Normalize score to a 0-1000 scale (standard for SNBT)
    const normalizedScore = maxPossibleWeightedScore > 0
        ? (weightedScore / maxPossibleWeightedScore) * 1000
        : 0;

    return {
        rawScore: (correctCount / questions.length) * 100,
        weightedScore: Math.round(normalizedScore),
        totalQuestions: questions.length,
        correctCount
    };
}
