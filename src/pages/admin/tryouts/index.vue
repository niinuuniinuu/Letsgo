<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const client = useSupabaseClient()
const search = ref('')

const { data: tryouts, refresh } = await useAsyncData('admin-tryouts', async () => {
  const { data } = await client
    .from('tryouts')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
})

const filteredTryouts = computed(() => {
  if (!search.value) return tryouts.value
  return tryouts.value?.filter(t => t.title.toLowerCase().includes(search.value.toLowerCase()))
})

const createNew = async () => {
  const title = prompt('Masukkan Judul Tryout Baru:')
  if (!title) return

  const { data, error } = await client
    .from('tryouts')
    .insert({ title, status: 'inactive' })
    .select()
    .single()

  if (error) {
    alert('Gagal membuat: ' + error.message)
  } else {
    navigateTo(`/admin/tryouts/${data.id}`)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Kelola Tryout</h1>
      <button @click="createNew" class="btn-primary flex items-center gap-2">
        <LucidePlus :size="18" />
        Buat Baru
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6 relative">
      <LucideSearch :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input 
        v-model="search"
        type="text" 
        placeholder="Cari judul tryout..." 
        class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none text-white placeholder-slate-500"
      >
    </div>

    <!-- Table -->
    <div class="space-y-4">
      <BaseGlassCard v-for="t in filteredTryouts" :key="t.id" class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
        <div>
          <h3 class="font-bold text-lg text-white mb-1">{{ t.title }}</h3>
          <div class="flex items-center gap-4 text-sm text-slate-400">
            <span class="px-2 py-0.5 rounded text-xs uppercase font-bold" :class="t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'">
              {{ t.status }}
            </span>
            <span>{{ t.duration_minutes }} Menit</span>
            <span>Rp {{ t.price }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <NuxtLink :to="`/admin/tryouts/${t.id}`" class="p-2 hover:text-indigo-400 text-slate-400 transition-colors" title="Edit Detail">
            <LucideEdit :size="20" />
          </NuxtLink>
           <NuxtLink :to="`/admin/tryouts/${t.id}/questions`" class="p-2 hover:text-emerald-400 text-slate-400 transition-colors" title="Kelola Soal">
            <LucideListChecks :size="20" />
          </NuxtLink>
        </div>
      </BaseGlassCard>
    </div>
  </div>
</template>
