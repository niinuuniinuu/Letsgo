<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const handleRegister = async () => {
  try {
    loading.value = true
    errorMsg.value = ''

    if (password.value !== confirmPassword.value) {
      throw new Error("Passwords do not match")
    }
    
    const { error } = await client.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) throw error
    
    // For Supabase, successful signup might require email confirmation
    // Usually it logs you in automatically if email confirmation is off, 
    // or waits if it's on. We'll assume auto-login or basic feedback for now.
    alert('Registration successful! Please check your email if confirmation is required.')
    
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
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
          Create Account
        </h1>
        <p class="text-slate-400">Start your journey to success</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <AuthSocialButtons />
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-300">Email</label>
          <input 
            v-model="email"
            type="email" 
            required
            class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
            placeholder="you@example.com"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-300">Password</label>
          <input 
            v-model="password"
            type="password" 
            required
            class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-300">Confirm Password</label>
          <input 
            v-model="confirmPassword"
            type="password" 
            required
            class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn-primary !bg-pink-600 hover:!bg-pink-500 !shadow-[0_0_20px_rgba(236,72,153,0.3)] w-full flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span v-else>Register</span>
        </button>
      </form>

      <div class="text-center text-sm text-slate-400">
        Already have an account? 
        <NuxtLink to="/login" class="text-pink-400 hover:text-pink-300 font-medium transition-colors">
          Sign In
        </NuxtLink>
      </div>
    </BaseGlassCard>
  </div>
</template>
