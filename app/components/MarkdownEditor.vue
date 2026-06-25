<script setup lang="ts">
const { raw, update } = useMarkdown()

defineProps<{ centered?: boolean }>()
</script>

<template>
  <div class="h-full print:hidden">
    <textarea
      :value="raw"
      class="w-full h-full resize-none bg-transparent text-taupe-800 placeholder:text-taupe-400 font-mono text-sm leading-relaxed focus:outline-none"
      :class="centered ? 'py-6' : 'p-6'"
      :style="centered ? { paddingInline: 'max(1.5rem, calc(50% - 24rem))' } : undefined"
      placeholder="Start writing markdown..."
      spellcheck="false"
      @input="update(($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>
