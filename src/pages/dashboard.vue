<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()



interface Tryout {
  id: string
  title: string
  description: string
  duration_minutes: number
  is_free: boolean
  scoring_type: string
  status: string
  created_at: string
}

// Fetch tryouts
const { data: tryouts, error, pending } = await useAsyncData<Tryout[]>('tryouts', async () => {
  const { data } = await client
    .from('tryouts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  return data as Tryout[]
})


// Fetch Purchased Tryouts
const { data: purchasedTryouts, refresh: refreshPurchases } = await useFetch<string[]>('/api/payment/purchases')

const startTryout = (tryoutId: string) => {
  navigateTo(`/tryout/${tryoutId}`)
}

const buyTryout = async (tryout: Tryout) => {
  try {
    // 1. Get Token
    const response = await $fetch<{ token: string }>('/api/payment/checkout', {
      method: 'POST',
      body: { tryoutId: tryout.id }
    })
    const token = response.token

    // 2. Open Snap
    if (window.snap) {
      window.snap.pay(token, {
        onSuccess: async function(result: any) {
          alert('Pembayaran Berhasil! 🎉')
          await refreshPurchases() // Refresh access
        },
        onPending: function(result: any) {
          alert('Menunggu pembayaran...')
        },
        onError: function(result: any) {
          alert('Pembayaran gagal!')
        },
        onClose: function() {
          console.log('Customer closed the popup without finishing the payment')
        }
      })
    } else {
      alert('Payment Error: Snap JS not loaded')
    }

  } catch (err: any) {
    alert(err.message || 'Gagal memulai transaksi')
  }
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
    
    <!-- Welcome Section -->
    <div class="space-y-2">
      <h1 class="text-3xl md:text-4xl font-bold text-white">
        Dashboard
      </h1>
      <p class="text-slate-400">
        Welcome back, <span class="text-indigo-400 font-medium">{{ user?.email }}</span>.
      </p>
    </div>

    <!-- Stats Overview (Placeholder) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseGlassCard class="flex items-center gap-4">
        <div class="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
          <LucideActivity :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Tryout Selesai</div>
          <div class="text-2xl font-bold text-white">0</div>
        </div>
      </BaseGlassCard>
      
      <BaseGlassCard class="flex items-center gap-4">
        <div class="p-3 rounded-xl bg-pink-500/20 text-pink-400">
          <LucideTrendingUp :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Rata-rata Skor</div>
          <div class="text-2xl font-bold text-white">-</div>
        </div>
      </BaseGlassCard>

      <BaseGlassCard class="flex items-center gap-4">
        <div class="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
          <LucideTarget :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Target PTN</div>
          <div class="text-2xl font-bold text-white">Belum Set</div>
        </div>
      </BaseGlassCard>
    </div>

    <!-- Available Tryouts -->
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
        <LucideBookOpen :size="24" class="text-indigo-400" />
        Available Tryouts
      </h2>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BaseGlassCard v-for="i in 3" :key="i" class="h-64 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex justify-between">
              <BaseSkeleton class="w-16 h-6 rounded-full" />
              <BaseSkeleton class="w-12 h-4" />
            </div>
            <BaseSkeleton class="w-3/4 h-8" />
            <BaseSkeleton class="w-full h-16" />
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-white/5">
            <BaseSkeleton class="w-20 h-4" />
            <BaseSkeleton class="w-16 h-8 rounded-lg" />
          </div>
        </BaseGlassCard>
      </div>

      <div v-else-if="error" class="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        Failed to load tryouts. Please check your connection.
      </div>

      <div v-else-if="!tryouts?.length" class="p-12 text-center rounded-2xl border border-dashed border-white/10 text-slate-500">
        No active tryouts found. Check back later!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BaseGlassCard 
          v-for="tryout in tryouts" 
          :key="tryout.id"
          class="flex flex-col h-full group hover:border-indigo-500/30 transition-colors"
        >
          <div class="flex justify-between items-start mb-4">
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="tryout.is_free ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'"
            >
              {{ tryout.is_free ? 'Free' : 'Premium' }}
            </span>
            <span class="text-slate-400 text-sm flex items-center gap-1">
              <LucideClock :size="14" />
              {{ tryout.duration_minutes }}m
            </span>
          </div>

          <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {{ tryout.title }}
          </h3>
          
          <p class="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
            {{ tryout.description || 'No description provided.' }}
          </p>

          <div class="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
            <div class="text-sm text-slate-500">
              {{ tryout.scoring_type === 'irt' ? '⚡ IRT Scoring' : 'Classic' }}
            </div>
            
            <button 
              v-if="tryout.is_free || (purchasedTryouts || []).includes(tryout.id)"
              @click="startTryout(tryout.id)"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Start
            </button>
            <button 
              v-else
              @click="buyTryout(tryout)"
              class="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
            >
             <LucideLock :size="14" />
             Beli (50k)
            </button>
          </div>
        </BaseGlassCard>
      </div>
    </div>
  </div>
</template>
