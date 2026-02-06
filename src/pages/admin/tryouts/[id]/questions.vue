<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const client = useSupabaseClient()
const tryoutId = route.params.id as string

// Fetch Questions
const { data: questions, refresh } = await useAsyncData(`questions-${tryoutId}`, async () => {
  const { data } = await client
    .from('questions')
    .select('*')
    .eq('tryout_id', tryoutId)
    .order('order_index', { ascending: true })
  return (data || []) as any[]
})

const createQuestion = async () => {
  const { error } = await client.from('questions').insert({
    tryout_id: tryoutId,
    content: { text: 'Soal Baru', question: '...' },
    options: [
      { label: 'A', text: 'Opsi A' },
      { label: 'B', text: 'Opsi B' },
      { label: 'C', text: 'Opsi C' },
      { label: 'D', text: 'Opsi D' },
      { label: 'E', text: 'Opsi E' }
    ],
    correct_answer: 'A',
    irt_weight: 1.0,
    category: 'Penalaran Umum',
    order_index: (questions.value?.length || 0) + 1
  } as any)

  if (error) alert('Error: ' + error.message)
  else refresh()
}

const deleteQuestion = async (id: string) => {
  if (!confirm('Hapus soal ini?')) return
  await client.from('questions').delete().eq('id', id)
  refresh()
}

// Simple Inline Editor State
const editingId = ref<string | null>(null)
const editForm = ref<any>({})

const startEdit = (q: any) => {
  editingId.value = q.id
  editForm.value = JSON.parse(JSON.stringify(q)) // Deep copy
}

const saveEdit = async () => {
  const { error } = await client
    .from('questions')
    .update({
      content: editForm.value.content,
      options: editForm.value.options,
      correct_answer: editForm.value.correct_answer,
      irt_weight: editForm.value.irt_weight,
      category: editForm.value.category
    } as any)
    .eq('id', editingId.value)

  if (error) alert('Error: ' + error.message)
  else {
    editingId.value = null
    refresh()
  }
}

const uploadImage = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${tryoutId}/${fileName}`

  // Upload
  const { error: uploadError } = await client
    .storage
    .from('question-images')
    .upload(filePath, file)

  if (uploadError) {
    alert('Upload gagal: ' + uploadError.message)
    return
  }

  // Get Public URL
  const { data: { publicUrl } } = client
    .storage
    .from('question-images')
    .getPublicUrl(filePath)

  // Update Form
  if (!editForm.value.content) editForm.value.content = {}
  editForm.value.content.image = publicUrl
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink :to="`/admin/tryouts/${tryoutId}`" class="text-slate-400 hover:text-white">
          <LucideArrowLeft :size="24" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Kelola Soal</h1>
      </div>
      <button @click="createQuestion" class="btn-primary flex items-center gap-2">
        <LucidePlus :size="18" />
        Tambah Soal
      </button>
    </div>

    <div class="space-y-6">
      <BaseGlassCard v-for="(q, idx) in questions" :key="q.id" class="p-6">
        <!-- View Mode -->
        <div v-if="editingId !== q.id">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">{{ q.category }}</span>
              <h3 class="font-bold text-white text-lg mt-1">No. {{ idx + 1 }}</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Bobot: {{ q.irt_weight }}</span>
              <button @click="startEdit(q)" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
                <LucideEdit :size="18" />
              </button>
              <button @click="deleteQuestion(q.id)" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                <LucideTrash2 :size="18" />
              </button>
            </div>
          </div>
          
          <img v-if="q.content.image" :src="q.content.image" class="max-h-64 rounded-lg mb-4 border border-white/10" />
          <div class="text-slate-300 mb-4 whitespace-pre-wrap font-serif text-lg leading-relaxed text-justify">{{ q.content.text }}</div>
          <div class="text-white font-bold mb-6 text-lg">{{ q.content.question }}</div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div 
              v-for="opt in q.options" 
              :key="opt.label"
              class="px-4 py-3 rounded-lg border flex items-start gap-3"
              :class="opt.label === q.correct_answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-transparent text-slate-400'"
            >
              <span class="font-bold bg-white/10 w-6 h-6 flex items-center justify-center rounded text-xs">{{ opt.label }}</span>
              <span>{{ opt.text }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-slate-400">Kategori</label>
              <input v-model="editForm.category" class="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm">
            </div>
             <div>
              <label class="text-xs text-slate-400">Bobot IRT</label>
              <input v-model.number="editForm.irt_weight" type="number" step="0.1" class="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm">
            </div>
          </div>

          <div>
            <label class="text-xs text-slate-400 block mb-2">Gambar (Opsional)</label>
            <div v-if="editForm.content.image" class="mb-2 relative inline-block group">
               <img :src="editForm.content.image" class="h-32 rounded border border-white/10">
               <button @click="editForm.content.image = null" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <LucideX :size="12" />
               </button>
            </div>
            <input @change="uploadImage" type="file" accept="image/*" class="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20">
          </div>

          <div>
            <label class="text-xs text-slate-400">Teks Bacaan / Konteks</label>
            <textarea v-model="editForm.content.text" rows="4" class="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm font-serif"></textarea>
          </div>

          <div>
            <label class="text-xs text-slate-400">Pertanyaan</label>
            <textarea v-model="editForm.content.question" rows="2" class="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm font-bold"></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-slate-400 block">Opsi Jawaban & Kunci</label>
            <div v-for="(opt, i) in editForm.options" :key="i" class="flex gap-2">
              <label class="w-10 flex items-center justify-center font-bold text-slate-500 bg-black/20 rounded cursor-pointer hover:bg-emerald-500/20" :class="{'bg-emerald-500/20 text-emerald-400': editForm.correct_answer === opt.label}">
                <input 
                  type="radio" 
                  :name="'correct-' + editingId" 
                  :value="opt.label" 
                  v-model="editForm.correct_answer"
                  class="hidden"
                >
                {{ opt.label }}
              </label>
              <input v-model="opt.text" class="flex-1 bg-black/20 border border-white/10 rounded p-2 text-white text-sm">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button @click="editingId = null" class="px-3 py-1 text-sm text-slate-400 hover:text-white">Batal</button>
            <button @click="saveEdit" class="btn-primary py-1 px-4 text-sm">Simpan</button>
          </div>
        </div>
      </BaseGlassCard>
    </div>
  </div>
</template>
