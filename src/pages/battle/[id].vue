<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

const matchId = route.params.id as string
const loading = ref(true)
const match = ref<any>(null)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const myScore = ref(0)
const opponentScore = ref(0)
const opponentProgress = ref(0) // 0 to 100
const matchStatus = ref('waiting') // waiting, playing, finished
const winnerId = ref<string | null>(null)

let channel: RealtimeChannel

// --- Init ---
onMounted(async () => {
    await fetchMatchDetails()
    setupRealtime()
})

onUnmounted(() => {
    if (channel) client.removeChannel(channel)
})

// --- Data Fetching ---
const fetchMatchDetails = async () => {
    // 1. Get Match
    const { data: m, error } = await client
        .from('matches')
        .select(`*, tryout:tryouts(*)`)
        .eq('id', matchId)
        .single()
    
    if (error || !m) {
        alert('Match not found')
        return router.push('/battle')
    }
    match.value = m
    matchStatus.value = m.status

    // 2. Get Questions
    const { data: q } = await client
        .from('questions')
        .select('*')
        .eq('tryout_id', m.tryout_id)
        .limit(5) // Fast 5-question battle
    
    questions.value = q || []
    loading.value = false
}

// --- Realtime ---
const setupRealtime = () => {
    channel = client.channel(`match_room:${matchId}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'matches', 
            filter: `id=eq.${matchId}` 
        }, (payload: any) => {
            const newMatch = payload.new
            matchStatus.value = newMatch.status
            
            // Sync opponent score/progress if needed?
            // Actually simpler to just listen to broadcast events for UI
        })
        .on('broadcast', { event: 'player_update' }, (payload) => {
             // payload: { playerId: string, progress: number, score: number }
             if (payload.payload.playerId !== user.value?.id) {
                 opponentProgress.value = payload.payload.progress
                 opponentScore.value = payload.payload.score
             }
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // If I am player 2 and just joined, notify player 1?
                // The postgres update triggered by find API handled the status change.
            }
        })
}

// --- Gameplay ---
const handleAnswer = async (optionIndex: number) => {
    const question = questions.value[currentQuestionIndex.value]
    const isCorrect = optionIndex === question.correct_option
    
    if (isCorrect) myScore.value += 100
    
    // Move next
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
    } else {
        // Game Over for me
        await finishGame()
    }

    // Broadcast Progress
    const progress = ((currentQuestionIndex.value + 1) / questions.value.length) * 100
    await channel.send({
        type: 'broadcast',
        event: 'player_update',
        payload: {
            playerId: user.value?.id,
            progress: progress,
            score: myScore.value
        }
    })
}

const finishGame = async () => {
    matchStatus.value = 'finished' // Local finish view
    // Update DB final score
}

const myProgress = computed(() => {
    if (questions.value.length === 0) return 0
    return (currentQuestionIndex.value / questions.value.length) * 100
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-4">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <span class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="max-w-4xl mx-auto space-y-8">
        <!-- Header: VS Bar -->
        <div class="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <!-- Me -->
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-xl">👤</div>
                <div>
                    <div class="font-bold text-indigo-400">YOU</div>
                    <div class="text-2xl font-mono">{{ myScore }}</div>
                </div>
            </div>

            <!-- VS -->
            <div class="text-2xl font-black italic text-slate-600">VS</div>

            <!-- Opponent -->
            <div class="flex items-center gap-4 text-right">
                <div>
                    <div class="font-bold text-red-400">OPPONENT</div>
                    <div class="text-2xl font-mono">{{ opponentScore }}</div>
                </div>
                <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-xl">😈</div>
            </div>
        </div>

        <!-- Progress Bars -->
        <div class="space-y-2">
            <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 transition-all duration-300" :style="{ width: `${myProgress}%` }" />
            </div>
            <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 transition-all duration-300" :style="{ width: `${opponentProgress}%` }" />
            </div>
        </div>

        <!-- Waiting Room -->
        <div v-if="matchStatus === 'waiting'" class="text-center py-20">
            <div class="text-6xl mb-4">⏳</div>
            <h2 class="text-2xl font-bold">Waiting for Opponent...</h2>
            <p class="text-slate-400">Do not leave this page.</p>
        </div>

        <!-- Gameplay Arena -->
        <div v-else-if="matchStatus === 'playing'" class="grid gap-8">
           <BaseGlassCard class="p-8">
                <div class="mb-4 text-sm font-mono text-slate-400">
                    QUESTION {{ currentQuestionIndex + 1 }} / {{ questions.length }}
                </div>
                
                <h3 class="text-xl font-medium mb-8">
                    {{ questions[currentQuestionIndex].text }}
                </h3>

                <div class="grid grid-cols-1 gap-3">
                    <button 
                        v-for="(option, idx) in questions[currentQuestionIndex].options"
                        :key="idx"
                        @click="handleAnswer(idx)"
                        class="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left border border-white/10 hover:border-indigo-500/50 transition-all"
                    >
                        {{ option }}
                    </button>
                </div>
           </BaseGlassCard>
        </div>

        <!-- Game Over -->
        <div v-else class="text-center py-20">
            <h2 class="text-4xl font-bold mb-4">Game Over!</h2>
            <div class="text-xl">
                Your Score: <span class="text-indigo-400 font-bold">{{ myScore }}</span>
            </div>
            <div class="mt-8">
                <NuxtLink to="/battle" class="btn-primary">Play Again</NuxtLink>
            </div>
        </div>
    </div>
  </div>
</template>
