<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)
const router = useRouter()

const findMatch = async () => {
  try {
    loading.value = true
    const { matchId } = await $fetch('/api/battle/find', {
      method: 'POST'
    })
    router.push(`/battle/${matchId}`)
  } catch (error) {
    alert('Failed to find match')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
          Battle Arena ⚔️
        </h1>
        <p class="text-slate-400 text-lg">Challenge other students in real-time 1v1 quizzes</p>
      </div>

      <!-- Action Card -->
      <BaseGlassCard class="p-12 text-center space-y-8 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div class="relative z-10 space-y-6">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span class="text-4xl">🥊</span>
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-white">Ranked Match</h2>
            <p class="text-slate-400">Compete for MMR and glory</p>
          </div>

          <button 
            @click="findMatch"
            :disabled="loading"
            class="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white font-bold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </span>
            <span v-else>Find Match</span>
          </button>
        </div>
      </BaseGlassCard>
      
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseGlassCard class="p-6 text-center">
            <div class="text-2xl font-bold text-white">0</div>
            <div class="text-sm text-slate-400">Wins</div>
        </BaseGlassCard>
        <BaseGlassCard class="p-6 text-center">
            <div class="text-2xl font-bold text-orange-400">1000</div>
            <div class="text-sm text-slate-400">MMR</div>
        </BaseGlassCard>
        <BaseGlassCard class="p-6 text-center">
            <div class="text-2xl font-bold text-white">0</div>
            <div class="text-sm text-slate-400">Matches</div>
        </BaseGlassCard>
      </div>
    </div>
  </div>
</template>
