<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const client = useSupabaseClient()

// Fetch Stats
const { data: stats } = await useAsyncData('admin-stats', async () => {
  const { count: usersCount } = await client.from('profiles').select('*', { count: 'exact', head: true })
  const { count: tryoutsCount } = await client.from('tryouts').select('*', { count: 'exact', head: true })
  // const { count: attemptsCount } = await client.from('student_exams').select('*', { count: 'exact', head: true })

  return {
    users: usersCount || 0,
    tryouts: tryoutsCount || 0
  }
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseGlassCard class="p-6">
        <div class="flex items-center gap-4 text-emerald-400 mb-2">
          <LucideUsers :size="24" />
          <span class="font-medium">Total Users</span>
        </div>
        <div class="text-4xl font-black text-white">{{ stats?.users }}</div>
      </BaseGlassCard>

      <BaseGlassCard class="p-6">
        <div class="flex items-center gap-4 text-cyan-400 mb-2">
          <LucideFileText :size="24" />
          <span class="font-medium">Total Tryouts</span>
        </div>
        <div class="text-4xl font-black text-white">{{ stats?.tryouts }}</div>
      </BaseGlassCard>

       <BaseGlassCard class="p-6 opacity-50">
        <div class="flex items-center gap-4 text-purple-400 mb-2">
          <LucideActivity :size="24" />
          <span class="font-medium">Jadwal Ujian</span>
        </div>
        <div class="text-4xl font-black text-white">-</div>
      </BaseGlassCard>
    </div>
  </div>
</template>
