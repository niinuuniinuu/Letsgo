<script setup lang="ts">
defineProps<{
  question: any
  selectedOption?: string | null
}>()

defineEmits<{
  (e: 'select', optionLabel: string): void
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Question Content -->
    <div class="space-y-4">
      <div v-if="question.content.text" class="text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
        {{ question.content.text }}
      </div>
      <div v-if="question.content.question" class="text-lg md:text-xl text-white font-semibold">
        {{ question.content.question }}
      </div>
    </div>

    <!-- Options -->
    <div class="space-y-3 pt-4">
      <button
        v-for="opt in question.options"
        :key="opt.label"
        @click="$emit('select', opt.label)"
        class="w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden border"
        :class="[
          selectedOption === opt.label 
            ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        ]"
      >
        <div class="flex items-start gap-4 z-10 relative">
          <div 
            class="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
            :class="[
              selectedOption === opt.label 
                ? 'bg-indigo-500 text-white' 
                : 'bg-white/10 text-slate-400 group-hover:bg-white/20 group-hover:text-slate-200'
            ]"
          >
            {{ opt.label }}
          </div>
          <span 
            class="text-base pt-1 transition-colors"
            :class="selectedOption === opt.label ? 'text-white' : 'text-slate-300 group-hover:text-slate-100'"
          >
            {{ opt.text }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
