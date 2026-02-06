<script setup lang="ts">
const plans = [
  {
    name: 'Gratis',
    price: '0',
    description: 'Cocok untuk mencoba fitur dasar platform.',
    features: ['1 Tryout Gratis/Bulan', 'Hasil Skor Instan', 'Analisis Dasar'],
    buttonText: 'Mulai Sekarang',
    buttonLink: '/register',
    popular: false
  },
  {
    name: 'Premium',
    price: '49.000',
    description: 'Pilihan terbaik untuk persiapan maksimal UTBK.',
    features: ['Akses Semua Tryout', 'Analisis Kelemahan Topik', 'Sertifikat Kelulusan', 'Bebas Iklan'],
    buttonText: 'Beli Paket',
    buttonLink: '/dashboard',
    popular: true
  },
  {
    name: 'Master',
    price: '99.000',
    description: 'Paket lengkap dengan fitur Battle & Live Class.',
    features: ['Semua Fitur Premium', 'Akses Battle Mode Unlimited', 'Prioritas Dukungan', 'Materi PDF Eksklusif'],
    buttonText: 'Pilih Master',
    buttonLink: '/dashboard',
    popular: false
  }
]
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4">Investasi Masa Depan</h2>
      <h1 class="text-4xl md:text-5xl font-black text-white mb-6">Pilih Paket Belajarmu</h1>
      <p class="text-slate-400 max-w-2xl mx-auto text-lg">
        Dapatkan akses penuh ke simulasi SNBT tercanggih dengan sistem penilaian IRT dan analisis mendalam.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div 
        v-for="plan in plans" 
        :key="plan.name"
        class="relative group"
      >
        <div v-if="plan.popular" class="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Paling Populer</span>
        </div>
        
        <BaseGlassCard 
          class="h-full p-8 flex flex-col transition-all duration-300 group-hover:border-indigo-500/50 group-hover:scale-[1.02]"
          :class="plan.popular ? 'border-indigo-500/30 !bg-indigo-500/5' : ''"
        >
          <div class="mb-8">
            <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-slate-400 text-sm">Rp</span>
              <span class="text-4xl font-black text-white">{{ plan.price }}</span>
              <span class="text-slate-500 text-sm">/selamanya</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">{{ plan.description }}</p>
          </div>

          <div class="space-y-4 mb-8 flex-1">
            <div 
              v-for="feature in plan.features" 
              :key="feature"
              class="flex items-center gap-3 text-sm text-slate-300"
            >
              <div class="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              {{ feature }}
            </div>
          </div>

          <NuxtLink 
            :to="plan.buttonLink"
            class="w-full py-4 text-center rounded-xl font-bold transition-all shadow-xl block"
            :class="plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'"
          >
            {{ plan.buttonText }}
          </NuxtLink>
        </BaseGlassCard>
      </div>
    </div>

    <div class="mt-20 p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
      <div>
        <h3 class="text-xl font-bold text-white mb-2">Ingin paket sekolah/bimbel?</h3>
        <p class="text-slate-400">Dapatkan diskon khusus untuk pembelian kolektif lebih dari 50 akun.</p>
      </div>
      <button class="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
        Hubungi Sales
      </button>
    </div>
  </div>
</template>
