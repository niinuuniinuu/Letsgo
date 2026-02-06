<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const client = useSupabaseClient()
const id = route.params.id

const form = ref({
  title: '',
  description: '',
  duration_minutes: 120,
  price: 0,
  status: 'inactive'
})

// Load Data
const { data, refresh } = await useAsyncData(`tryout-${id}`, async () => {
  const { data } = await client.from('tryouts').select('*').eq('id', id).single()
  if (data) Object.assign(form.value, data)
  return data
})

const save = async () => {
  const { error } = await client
    .from('tryouts')
    .update(form.value)
    .eq('id', id)

  if (error) alert('Error: ' + error.message)
  else alert('Berhasil disimpan!')
}

const deleteTryout = async () => {
  if (!confirm('Yakin hapus tryout ini? Data soal dan nilai user akan hilang!')) return

  const { error } = await client.from('tryouts').delete().eq('id', id)
  
  if (error) alert('Error: ' + error.message)
  else navigateTo('/admin/tryouts')
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/tryouts" class="text-slate-400 hover:text-white">
          <LucideArrowLeft :size="24" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Edit Tryout</h1>
      </div>
      
      <div class="flex items-center gap-2">
        <button @click="deleteTryout" class="px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors text-sm font-medium">
          Hapus
        </button>
        <button @click="save" class="btn-primary">
          Simpan Perubahan
        </button>
      </div>
    </div>

    <!-- Form -->
    <BaseGlassCard class="space-y-6 p-8">
      <div>
        <label class="block text-slate-400 text-sm mb-2">Judul Tryout</label>
        <input v-model="form.title" type="text" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
      </div>

      <div>
        <label class="block text-slate-400 text-sm mb-2">Deskripsi</label>
        <textarea v-model="form.description" rows="3" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-slate-400 text-sm mb-2">Durasi (Menit)</label>
          <input v-model="form.duration_minutes" type="number" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
        </div>
        <div>
          <label class="block text-slate-400 text-sm mb-2">Harga (Rp)</label>
          <input v-model="form.price" type="number" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
        </div>
      </div>

      <div>
        <label class="block text-slate-400 text-sm mb-2">Status Publikasi</label>
        <select v-model="form.status" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
          <option value="inactive">Draft (Tidak Muncul)</option>
          <option value="active">Active (Dapat Diakses)</option>
        </select>
      </div>
    </BaseGlassCard>
  </div>
</template>
