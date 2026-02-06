<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()
const tryoutId = route.params.id as string

// State
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, string>>({})
const userExamId = ref<string | null>(null)

interface Question {
  id: string
  content: { text?: string; question?: string }
  options: { label: string; text: string }[]
  irt_weight: number
  category: string
}

interface TryoutData {
  tryout: {
    duration_minutes: number
  }
  questions: Question[]
}

// Fetch Data
const { data: tryoutData, error, pending } = await useAsyncData<TryoutData>(`tryout-${tryoutId}`, async () => {
  // 1. Get Tryout Details
  const { data: tryout } = await client
    .from('tryouts')
    .select('*')
    .eq('id', tryoutId)
    .single()
  
  if (!tryout) throw new Error('Tryout not found')

  // 2. Get Questions
  const { data: questions } = await client
    .from('questions')
    .select('*')
    .eq('tryout_id', tryoutId)
    .order('order_index', { ascending: true })

  return { tryout, questions: questions || [] } as TryoutData
})

const timeLeft = ref(0)
let timerInterval: NodeJS.Timeout | null = null

// Computed
const questions = computed(() => tryoutData.value?.questions || [])
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})
const progressPercentage = computed(() => {
  if (!questions.value.length) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

// Methods
const handleSelect = async (optionLabel: string) => {
  if (currentQuestion.value) {
    // Optimistic Update
    answers.value[currentQuestion.value.id] = optionLabel

    // Real-time Save
    if (userExamId.value) {
      await $fetch('/api/tryout/save-answer', {
        method: 'POST',
        body: {
          attemptId: userExamId.value,
          questionId: currentQuestion.value.id,
          selectedOption: optionLabel
        }
      })
    }
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const submitExam = async (auto = false) => {
  if (!auto && !confirm('Apakah anda yakin ingin mengumpulkan jawaban?')) return

  try {
    if (!user.value) return

    const { data, error } = await useFetch<{ score: number, attemptId: string }>('/api/tryout/submit', {
      method: 'POST',
      body: {
        tryoutId,
        attemptId: userExamId.value
      }
    })

    if (error.value) throw error.value

    if (auto) alert('Waktu habis! Jawaban Anda telah dikumpulkan otomatis.')
    navigateTo(`/tryout/result/${data.value?.attemptId}`)
    
  } catch (e: any) {
    alert('Gagal mengumpulkan: ' + e.message)
  }
}

// Timer & Session Logic
onMounted(async () => {
  if (!user.value) return

  // 1. Initialize Session (Create or Resume)
  try {
    const { attemptId, existingAnswers, isResumed } = await $fetch<{ 
      attemptId: string, 
      existingAnswers: Record<string, string>, 
      isResumed: boolean 
    }>('/api/tryout/start', {
      method: 'POST',
      body: { tryoutId }
    })

    userExamId.value = attemptId
    answers.value = existingAnswers

    if (isResumed) {
      console.log('Resumed exam session:', attemptId)
    }

    // 2. Start Timer
    if (tryoutData.value?.tryout) {
      // NOTE: For a real "resume", we should calculate remaining time from created_at
      // For now, we just reset the timer for the session duration (MVP simplification)
      timeLeft.value = tryoutData.value.tryout.duration_minutes * 60
      
      timerInterval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
        } else {
          if (timerInterval) clearInterval(timerInterval)
          submitExam(true)
        }
      }, 1000)
    }
  } catch (e) {
    console.error(e)
    alert('Failed to initialize exam session')
    navigateTo('/dashboard')
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div v-if="pending" class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse text-indigo-400 font-bold text-xl">Loading Exam...</div>
  </div>

  <div v-else-if="error" class="min-h-screen flex items-center justify-center p-4">
    <BaseGlassCard class="text-center p-8 border-red-500/30">
      <h1 class="text-2xl font-bold text-red-400 mb-2">Error Loading Exam</h1>
      <p class="text-slate-400 mb-6">{{ error.message }}</p>
      <NuxtLink to="/dashboard" class="btn-primary bg-slate-700 hover:bg-slate-600">
        Back to Dashboard
      </NuxtLink>
    </BaseGlassCard>
  </div>

  <div v-else-if="tryoutData && currentQuestion" class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
    
    <!-- Sidebar / Navigation -->
    <aside class="w-full md:w-80 flex-shrink-0 space-y-6">
      <BaseGlassCard class="!p-4 sticky top-28">
        <div class="flex items-center justify-between mb-4">
          <span class="text-slate-400 text-sm font-medium">Sisa Waktu</span>
           <div class="flex items-center gap-2 text-pink-400 font-mono font-bold text-xl" :class="{'animate-pulse text-red-500': timeLeft < 60}">
            <LucideTimer :size="20" />
            <span>{{ formattedTime }}</span> 
          </div>
        </div>
        
        <div class="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          <button
            v-for="(q, idx) in questions"
            :key="q.id"
            @click="currentQuestionIndex = idx"
            class="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
            :class="[
              currentQuestionIndex === idx 
                ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/50' 
                : answers[q.id]
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
            ]"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <button 
          @click="() => submitExam()"
          class="btn-primary w-full mt-6 !bg-emerald-600 hover:!bg-emerald-500 !shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          Kumpulkan Jawaban
        </button>
      </BaseGlassCard>
    </aside>

    <!-- Main Question Area -->
    <main class="flex-1 min-w-0">
      <BaseGlassCard class="min-h-[500px] flex flex-col justify-between">
        <div class="mb-8">
          <div class="flex flex-wrap items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
            <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              Soal No. {{ currentQuestionIndex + 1 }}
            </h2>
            <div class="flex items-center gap-3">
              <span v-if="currentQuestion.category" class="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {{ currentQuestion.category }}
              </span>
              <span class="text-xs font-mono py-1 px-3 rounded-full bg-white/5 text-slate-400 border border-white/5">
                Bobot: {{ currentQuestion.irt_weight }}
              </span>
            </div>
          </div>

          <BaseExamQuestionCard 
            :question="currentQuestion" 
            :selected-option="answers[currentQuestion.id]"
            @select="handleSelect"
          />
        </div>

        <!-- Progress Bar mobile -->
        <div class="md:hidden w-full bg-slate-800 h-1 mt-4 mb-6 rounded-full overflow-hidden">
          <div class="bg-indigo-500 h-full transition-all duration-300" :style="{ width: `${progressPercentage}%` }" />
        </div>

        <div class="flex items-center justify-between pt-6 border-t border-white/5">
          <button 
            @click="prevQuestion"
            :disabled="currentQuestionIndex === 0"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LucideArrowLeft :size="18" />
            Sebelumnya
          </button>

          <button 
            @click="nextQuestion"
            :disabled="currentQuestionIndex === questions.length - 1"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Selanjutnya
            <LucideArrowRight :size="18" />
          </button>
        </div>
      </BaseGlassCard>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
