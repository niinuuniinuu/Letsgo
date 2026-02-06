<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(false)

const form = ref({
  full_name: '',
  school: '',
  email: ''
})

// Fetch Profile
const { refresh } = await useAsyncData('profile', async () => {
  if (!user.value) return
  
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()
    
  if (data) {
    const profile = data as any
    form.value = {
      full_name: profile.full_name || '',
      school: profile.school || '',
      email: user.value.email || ''
    }
  }
  return data
})

const updateProfile = async () => {
  if (!user.value) return 

  loading.value = true
  try {
    const updates = {
      full_name: form.value.full_name,
      school: form.value.school,
      updated_at: new Date().toISOString(),
    }

    const { error } = await (client
      .from('profiles') as any)
      .update(updates)
      .eq('id', user.value.id)

    if (error) throw error
    alert('Data profil berhasil diperbarui!')
    refresh()
  } catch (e: any) {
    alert('Gagal update: ' + e.message)
  } finally {
    loading.value = false
  }
}

const signOut = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Profil Saya</h1>
    </div>

    <BaseGlassCard class="p-8 space-y-6">
      
      <!-- Email (Read Only) -->
      <div>
        <label class="block text-slate-400 text-sm mb-2">Email</label>
        <div class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-slate-500 cursor-not-allowed">
          {{ form.email }}
        </div>
      </div>

      <!-- Full Name -->
      <div>
        <label class="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
        <input 
          v-model="form.full_name"
          type="text" 
          placeholder="Masukkan nama lengkap"
          class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
        >
      </div>

      <!-- School -->
      <div>
        <label class="block text-slate-400 text-sm mb-2">Asal Sekolah</label>
        <input 
          v-model="form.school"
          type="text" 
          placeholder="Contoh: SMA Negeri 1 Jakarta"
          class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
        >
      </div>

      <div class="pt-4 flex flex-col gap-4">
        <button 
          @click="updateProfile" 
          :disabled="loading"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Menyimpan...</span>
          <span v-else>Simpan Perubahan</span>
        </button>

        <button 
          @click="signOut" 
          class="w-full py-3 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all font-medium"
        >
          Keluar (Logout)
        </button>
      </div>

    </BaseGlassCard>
  </div>
</template>
