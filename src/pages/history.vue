<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface ExamAttempt {
  id: string
  tryout_id: string
  finished_at: string
  weighted_score: number
  tryouts: {
    title: string
  }
}

const { data: attempts, pending, error } = await useFetch<ExamAttempt[]>('/api/history')

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })
}

const getScoreColor = (score: number) => {
  if (score > 700) return 'text-emerald-400'
  if (score > 500) return 'text-indigo-400'
  return 'text-pink-400'
}

// Chart Logic
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

const chartData = computed(() => {
  if (!attempts.value) return { labels: [], datasets: [] }
  
  // Create a copy and reverse to show oldest first on chart
  const reversedAttempts = [...attempts.value].reverse()
  
  return {
    labels: reversedAttempts.map(a => new Date(a.finished_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Skor IRT',
        backgroundColor: '#818cf8',
        borderColor: '#6366f1',
        data: reversedAttempts.map(a => Math.round(a.weighted_score)),
        tension: 0.4,
        pointBackgroundColor: '#c7d2fe'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: '#94a3b8' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { 
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      displayColors: false
    }
  }
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">Riwayat Tryout</h1>
      <NuxtLink to="/dashboard" class="text-slate-400 hover:text-white transition-colors text-sm">
        &larr; Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-white/5 rounded-xl animate-pulse" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
      Gagal memuat riwayat: {{ error.message }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!attempts?.length" class="text-center py-16 rounded-2xl border border-dashed border-white/10">
      <div class="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
        <LucideHistory :size="32" />
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Belum Ada Riwayat</h3>
      <p class="text-slate-400 mb-6">Anda belum menyelesaikan tryout apapun.</p>
      <NuxtLink to="/dashboard" class="btn-primary">
        Mulai Tryout Sekarang
      </NuxtLink>
    </div>

    <!-- History Chart -->
    <BaseGlassCard v-if="attempts?.length && attempts.length > 1" class="p-6">
      <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <LucideTrendingUp :size="24" class="text-emerald-400" />
        Progress Skor
      </h3>
      <div class="h-64 w-full">
        <ClientOnly>
          <Line :data="chartData" :options="chartOptions" />
        </ClientOnly>
      </div>
    </BaseGlassCard>

    <!-- History List -->
    <div v-else-if="attempts?.length" class="space-y-4">
      <BaseGlassCard 
        v-for="attempt in attempts" 
        :key="attempt.id" 
        class="flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all"
      >
        <div class="flex-1 text-center md:text-left">
          <div class="text-sm text-slate-400 mb-1">{{ formatDate(attempt.finished_at) }}</div>
          <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {{ attempt.tryouts.title }}
          </h3>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">Skor IRT</div>
            <div class="text-2xl font-black" :class="getScoreColor(attempt.weighted_score)">
              {{ Math.round(attempt.weighted_score) }}
            </div>
          </div>
          
          <NuxtLink 
            :to="`/tryout/result/${attempt.id}`"
            class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Lihat Detail
          </NuxtLink>
        </div>
      </BaseGlassCard>
    </div>
  </div>
</template>
