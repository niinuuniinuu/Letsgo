<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    
    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error
    
    // Successful login will trigger the user watcher
  } catch (error: any) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <BaseGlassCard class="w-full max-w-md space-y-8 p-8">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
          Welcome Back
        </h1>
        <p class="text-slate-400">Sign in to continue your progress</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <AuthSocialButtons />

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-300">Email</label>
          <input 
            v-model="email"
            type="email" 
            required
            class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            placeholder="you@example.com"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-300">Password</label>
          <input 
            v-model="password"
            type="password" 
            required
            class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="text-center text-sm text-slate-400">
        Don't have an account? 
        <NuxtLink to="/register" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign up
        </NuxtLink>
      </div>
    </BaseGlassCard>
  </div>
</template>
