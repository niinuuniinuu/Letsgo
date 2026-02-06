<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const attemptId = route.params.id as string

interface ResultData {
  attempt: {
    weighted_score: number
    finished_at: string
    tryouts: { title: string }
  }
  answers: {
    id: string
    is_correct: boolean
    selected_option: string
    question: {
      category: string
      correct_answer: string
      content: { text?: string; question: string; image?: string }
      options: { label: string; text: string }[]
    }
  }[]
}

const { data, error, pending } = await useFetch<ResultData>(`/api/tryout/result/${attemptId}`)

const attempt = computed(() => data.value?.attempt)
const answers = computed(() => data.value?.answers || [])

const scoreColor = computed(() => {
  const score = attempt.value?.weighted_score || 0
  if (score > 700) return 'text-emerald-400'
  if (score > 500) return 'text-indigo-400'
  return 'text-pink-400'
})

// Topic Analysis Logic
const topicAnalysis = computed(() => {
  const analysis: Record<string, { correct: number; total: number }> = {}
  
  answers.value.forEach(ans => {
    const cat = ans.question.category || 'Uncategorized'
    if (!analysis[cat]) analysis[cat] = { correct: 0, total: 0 }
    
    analysis[cat].total++
    if (ans.is_correct) analysis[cat].correct++
  })

  return Object.entries(analysis).map(([topic, stats]) => ({
    topic,
    ...stats,
    percentage: Math.round((stats.correct / stats.total) * 100)
  })).sort((a, b) => b.percentage - a.percentage)
})

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
    
    <div v-if="pending" class="text-center py-12">
      <div class="animate-pulse text-xl font-bold text-indigo-400">Loading Results...</div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <h1 class="text-2xl font-bold text-red-400">Error Loading Results</h1>
      <p class="text-slate-400">{{ error.message }}</p>
      <NuxtLink to="/dashboard" class="btn-primary mt-4 inline-block">Back to Dashboard</NuxtLink>
    </div>

    <template v-else-if="attempt">
      <!-- Header / Summary Card -->
      <BaseGlassCard class="text-center py-10 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-emerald-500" />
        
        <h1 class="text-slate-400 font-medium tracking-wide uppercase text-sm mb-2">Hasil Tryout</h1>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-6">{{ attempt.tryouts.title }}</h2>

        <div class="flex flex-col items-center justify-center">
          <div class="text-6xl md:text-8xl font-black mb-2 tracking-tighter" :class="scoreColor">
            {{ Math.round(attempt.weighted_score) }}
          </div>
          <div class="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
            IRT Weighted Score
          </div>
        </div>

        <div class="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
          <div class="flex items-center gap-2">
            <LucideCalendar :size="16" />
            {{ formatTime(attempt.finished_at) }}
          </div>
          <div class="flex items-center gap-2">
            <LucideCheckCircle2 :size="16" class="text-emerald-400" />
            {{ answers.filter(a => a.is_correct).length }} Benar
          </div>
           <div class="flex items-center gap-2">
            <LucideXCircle :size="16" class="text-red-400" />
            {{ answers.filter(a => !a.is_correct).length }} Salah
          </div>
        </div>
        
        <div class="mt-8">
           <NuxtLink to="/dashboard" class="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
            Kembali ke Dashboard
          </NuxtLink>
        </div>
      </BaseGlassCard>

      <!-- Topic Analysis -->
      <BaseGlassCard>
        <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <LucidePieChart :size="24" class="text-indigo-400" />
          Analisis Topik
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div v-for="t in topicAnalysis" :key="t.topic" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-200 font-medium">{{ t.topic }}</span>
              <span class="font-bold" :class="t.percentage >= 70 ? 'text-emerald-400' : t.percentage >= 40 ? 'text-yellow-400' : 'text-red-400'">
                {{ t.percentage }}%
              </span>
            </div>
            <div class="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-1000"
                :class="t.percentage >= 70 ? 'bg-emerald-500' : t.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: `${t.percentage}%` }"
              />
            </div>
            <div class="text-xs text-slate-500 text-right">
              {{ t.correct }} dari {{ t.total }} benar
            </div>
          </div>
        </div>
      </BaseGlassCard>

      <!-- Detailed Review -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-white">Pembahasan & Detail</h3>
        
        <div v-for="(ans, idx) in answers" :key="ans.id" class="relative group">
          <BaseGlassCard class="!p-0 overflow-hidden flex flex-col md:flex-row">
            <!-- Status Strip -->
            <div class="w-full md:w-2 h-2 md:h-auto flex-shrink-0" :class="ans.is_correct ? 'bg-emerald-500' : 'bg-red-500'" />
            
            <div class="p-6 flex-1 space-y-4">
              <div class="flex justify-between items-start">
                <span class="text-sm font-mono text-slate-500">Soal {{ idx + 1 }} • {{ ans.question.category }}</span>
                <span 
                  class="px-2 py-1 rounded text-xs font-bold uppercase"
                  :class="ans.is_correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'"
                >
                  {{ ans.is_correct ? 'Benar' : 'Salah' }}
                </span>
              </div>

              <!-- Question Text -->
              <div class="text-lg text-slate-200">
                <img v-if="ans.question.content.image" :src="ans.question.content.image" class="max-h-48 rounded-lg mb-4 border border-white/10" />
                <p v-if="ans.question.content.text" class="mb-2 whitespace-pre-wrap font-serif text-justify text-slate-300">{{ ans.question.content.text }}</p>
                <p class="font-semibold">{{ ans.question.content.question }}</p>
              </div>

              <!-- Options Review -->
              <div class="grid grid-cols-1 gap-2 pt-2">
                <div 
                  v-for="opt in ans.question.options" 
                  :key="opt.label"
                  class="p-3 rounded-lg flex items-center gap-3 text-sm border transition-colors"
                   :class="[
                    opt.label === ans.question.correct_answer 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' // Correct Answer
                      : opt.label === ans.selected_option && !ans.is_correct
                        ? 'bg-red-500/10 border-red-500/30 text-red-100' // User's Wrong Answer
                        : 'bg-white/5 border-transparent text-slate-400 opacity-60' // Other options
                  ]"
                >
                  <div class="font-bold w-6">{{ opt.label }}</div>
                  <div>{{ opt.text }}</div>
                  
                  <div class="ml-auto" v-if="opt.label === ans.question.correct_answer">
                    <LucideCheck :size="16" class="text-emerald-400" />
                  </div>
                   <div class="ml-auto" v-if="opt.label === ans.selected_option && !ans.is_correct">
                    <LucideX :size="16" class="text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </BaseGlassCard>
        </div>
      </div>
    </template>
  </div>
</template>
