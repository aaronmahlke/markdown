<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

export type ViewMode = 'edit' | 'split' | 'preview'

const props = defineProps<{
  options: { value: ViewMode; label: string }[]
  modelValue: ViewMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewMode]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const buttonRefs = ref<(HTMLButtonElement | null)[]>([])
const indicator = ref<{ left: number; width: number } | null>(null)
const hasMeasured = ref(false)

const activeIndex = computed(() =>
  props.options.findIndex((o) => o.value === props.modelValue),
)

function measure() {
  const btn = buttonRefs.value[activeIndex.value]
  if (!btn) return
  const wasFirst = !hasMeasured.value
  hasMeasured.value = true
  indicator.value = { left: btn.offsetLeft, width: btn.offsetWidth }
  if (wasFirst) void btn.offsetHeight
}

useResizeObserver(containerRef, measure)

watch(activeIndex, () => nextTick(measure))

onMounted(() => requestAnimationFrame(measure))
</script>

<template>
  <div
    ref="containerRef"
    class="relative inline-flex rounded-lg bg-taupe-200/60 ring-1 ring-taupe-300/50"
  >
    <div
      aria-hidden
      class="absolute inset-y-0 p-0.5"
      :class="hasMeasured ? 'transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]' : 'transition-none'"
      :style="indicator ? { left: `${indicator.left}px`, width: `${indicator.width}px` } : { opacity: 0 }"
    >
      <div class="h-full rounded-md bg-white shadow-sm" />
    </div>

    <button
      v-for="(option, i) in options"
      :key="option.value"
      :ref="(el) => { buttonRefs[i] = el as HTMLButtonElement | null }"
      type="button"
      :aria-pressed="option.value === modelValue"
      class="relative z-10 flex items-center justify-center h-8 px-3.5 rounded-md text-sm font-medium select-none cursor-pointer transition-colors duration-150"
      :class="
        option.value === modelValue
          ? 'text-taupe-900'
          : 'text-taupe-500 hover:text-taupe-700'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
