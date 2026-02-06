<script setup lang="ts">
// Basic landing page prototype
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="max-w-4xl w-full text-center space-y-8">
      <h1 class="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
        Letsgo SNBT 2026
      </h1>
      
      <p class="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
        Platform Tryout SNBT & Seleksi Mandiri paling canggih untuk masa depanmu.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <BaseGlassCard class="flex flex-col items-center space-y-4">
          <div class="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
             <LucideZap :size="24" />
          </div>
          <h2 class="text-2xl font-bold">Tryout Gratis</h2>
          <p class="text-slate-400">Mulai simulasi pertamamu tanpa biaya. Coba fitur IRT kami.</p>
          <NuxtLink to="/dashboard" class="btn-primary w-full text-center">Mulai Tryout</NuxtLink>
        </BaseGlassCard>

        <BaseGlassCard class="flex flex-col items-center space-y-4 border-pink-500/20">
          <div class="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
             <LucideCrown :size="24" />
          </div>
          <h2 class="text-2xl font-bold text-pink-400">Tryout Premium</h2>
          <p class="text-slate-400">Dapatkan akses penuh ke soal-soal prediksi & analisis mendalam.</p>
          <NuxtLink to="/pricing" class="px-6 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-[0.98] w-full text-center">
            Buka Premium
          </NuxtLink>
        </BaseGlassCard>
      </div>
    </div>
  </div>
</template>
