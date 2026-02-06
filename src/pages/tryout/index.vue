<script setup lang="ts">
// If someone goes to /tryout, just send them to the dashboard
// where they can see the list of available tryouts.
await navigateTo('/dashboard')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
</template>
