<script setup lang="ts">
const client = useSupabaseClient()
const router = useRouter()

const logout = async () => {
  await client.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-white/10 flex-shrink-0 flex flex-col">
      <div class="p-6 border-b border-white/10">
        <h1 class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Admin Panel
        </h1>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink to="/admin" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors" active-class="bg-white/5 text-emerald-400">
          <LucideLayoutDashboard :size="20" />
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/tryouts" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors" active-class="bg-white/5 text-emerald-400">
          <LucideFileText :size="20" />
          Tryouts
        </NuxtLink>
        <NuxtLink to="/admin/users" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors" active-class="bg-white/5 text-emerald-400">
          <LucideUsers :size="20" />
          Users
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-white/10">
        <NuxtLink to="/" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-white">
          <LucideArrowLeft :size="20" />
          Student View
        </NuxtLink>
        <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors mt-2">
          <LucideLogOut :size="20" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
