<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="relative min-h-screen">
    <nav class="fixed top-0 left-0 right-0 z-50 p-4">
      <div class="max-w-7xl mx-auto glass-card !rounded-full py-3 px-8 flex items-center justify-between border-white/5 shadow-2xl">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="h-8 w-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg shadow-lg rotate-3" />
          <span class="text-xl font-black tracking-tight">LETSGO</span>
        </NuxtLink>
        
        <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <NuxtLink to="/" class="hover:text-white transition-colors">Home</NuxtLink>
          <NuxtLink to="/dashboard" class="hover:text-white transition-colors">Dashboard</NuxtLink>
          <NuxtLink to="/history" class="hover:text-white transition-colors">Riwayat</NuxtLink>
          <NuxtLink to="/leaderboard" class="hover:text-yellow-400 transition-colors text-yellow-200/80">Ranking</NuxtLink>
          <!-- Battle Mode Postponed 
          <NuxtLink to="/battle" class="group relative hover:text-white transition-colors flex items-center gap-2">
            <span class="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span class="text-orange-400 group-hover:text-orange-300">Battle ⚔️</span>
          </NuxtLink>
          -->
          <NuxtLink to="/profile" class="hover:text-white transition-colors">Profil</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-white transition-colors">Pricing</NuxtLink>
        </div>

        <div>
          <template v-if="user">
             <button @click="handleLogout" class="px-5 py-2 glass-card !bg-red-500/10 hover:!bg-red-500/20 !border-red-500/20 !rounded-full text-sm font-semibold text-red-400 transition-all">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="px-5 py-2 glass-card !bg-white/5 hover:!bg-white/10 !rounded-full text-sm font-semibold transition-all">
              Login
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main class="pt-24">
      <slot />
    </main>

    <footer class="py-12 text-center text-slate-500 text-sm border-t border-white/5 mt-12">
      &copy; 2026 Letsgo SNBT & Seleksi Mandiri. Developed with AI.
    </footer>
  </div>
</template>
