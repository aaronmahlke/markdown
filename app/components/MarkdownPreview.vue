<script setup lang="ts">
const { html } = useMarkdown()

defineProps<{ centered?: boolean }>()
</script>

<template>
  <div class="print-scroll h-full overflow-y-auto px-6 pt-10 pb-6">
    <div :class="centered ? 'mx-auto max-w-3xl' : ''">
      <article
        class="prose max-w-none"
        v-html="html"
      />
    </div>
  </div>
</template>
