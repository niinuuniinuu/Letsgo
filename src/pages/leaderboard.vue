<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// Types
interface Tryout {
  id: string
  title: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  school: string
  score: number
  date: string
}

const client = useSupabaseClient()

// Fetch Tryouts for Dropdown
const { data: tryouts } = await useAsyncData<Tryout[]>('tryout-list', async () => {
  const { data } = await client.from('tryouts').select('id, title').eq('status', 'active')
  return (data || []) as Tryout[]
})

const selectedTryoutId = ref<string>('')

// Set default selection
watchEffect(() => {
  if (tryouts.value && tryouts.value.length > 0 && !selectedTryoutId.value) {
    selectedTryoutId.value = tryouts.value[0]?.id
  }
})

// Fetch Leaderboard
const { data: leaderboard, pending } = await useAsyncData<LeaderboardEntry[]>(
  () => `leaderboard-${selectedTryoutId.value}`,
  async () => {
    if (!selectedTryoutId.value) return []
    return await $fetch(`/api/leaderboard?tryoutId=${selectedTryoutId.value}`)
  },
  {
    watch: [selectedTryoutId]
  }
)
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4">
        Hall of Fame 🏆
      </h1>
      <p class="text-slate-400">Lihat peringkat tertinggi dari pejuang PTN lainnya.</p>
    </div>

    <!-- Filter -->
    <div class="mb-8 flex justify-center">
      <div class="relative w-full max-w-md">
        <select 
          v-model="selectedTryoutId"
          class="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500/50 transition-all font-medium"
        >
          <option v-if="tryouts?.length === 0" disabled>Tidak ada tryout aktif</option>
          <option v-for="t in tryouts" :key="t.id" :value="t.id" class="bg-slate-900">
            {{ t.title }}
          </option>
        </select>
        <LucideChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="20" />
      </div>
    </div>

    <!-- Leaderboard Table -->
    <BaseGlassCard class="overflow-hidden !p-0">
      <div v-if="pending" class="p-6 space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
           <BaseSkeleton class="w-8 h-8 rounded-full" />
           <div class="flex-1 space-y-2">
             <BaseSkeleton class="w-1/3 h-4" />
             <BaseSkeleton class="w-1/4 h-3" />
           </div>
           <BaseSkeleton class="w-16 h-8 rounded" />
        </div>
      </div>

      <div v-else-if="leaderboard && leaderboard.length > 0">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/10 bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
              <th class="p-4 w-16 text-center">#</th>
              <th class="p-4">Nama Peserta</th>
              <th class="p-4 hidden md:table-cell">Asal Sekolah</th>
              <th class="p-4 text-right">Skor IRT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr 
              v-for="(entry, idx) in leaderboard" 
              :key="idx" 
              class="hover:bg-white/5 transition-colors group"
            >
              <td class="p-4 text-center font-bold">
                <span v-if="idx === 0" class="text-2xl">🥇</span>
                <span v-else-if="idx === 1" class="text-2xl">🥈</span>
                <span v-else-if="idx === 2" class="text-2xl">🥉</span>
                <span v-else class="text-slate-500">#{{ entry.rank }}</span>
              </td>
              <td class="p-4">
                <div class="font-bold text-white group-hover:text-yellow-400 transition-colors">{{ entry.name }}</div>
                <div class="md:hidden text-xs text-slate-500 mt-1">{{ entry.school }}</div>
              </td>
              <td class="p-4 text-slate-400 hidden md:table-cell">{{ entry.school }}</td>
              <td class="p-4 text-right font-mono font-bold text-lg text-emerald-400">
                {{ entry.score }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-12 text-center text-slate-500">
        <LucideTrophy :size="48" class="mx-auto mb-4 opacity-20" />
        <p>Belum ada data peringkat untuk tryout ini.</p>
        <p class="text-sm mt-2">Jadilah yang pertama menyelesaikannya!</p>
      </div>
    </BaseGlassCard>
  </div>
</template>
