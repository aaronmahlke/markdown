<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import type { ViewMode } from '~/components/SegmentedControl.vue'

const viewMode = useLocalStorage<ViewMode>('markdown-viewer-mode', 'split')

const viewOptions = [
  { value: 'edit' as ViewMode, label: 'Edit' },
  { value: 'split' as ViewMode, label: 'Split' },
  { value: 'preview' as ViewMode, label: 'Preview' },
]

const hydrated = ref(false)

const { openFile, closeFile, readFile, restoreHandle, reconnectFile, fileHandle, fileName, needsReconnect } = useMarkdown()

function exportPdf() {
  const prevMode = viewMode.value
  viewMode.value = 'preview'
  nextTick(() => window.print())
  nextTick(() => {
    setTimeout(() => {
      viewMode.value = prevMode
    }, 500)
  })
}

onMounted(() => {
  hydrated.value = true
  restoreHandle()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && fileHandle.value) {
      readFile()
    }
  })
})
</script>

<template>
  <div ref="appRoot" class="print-container h-screen flex flex-col bg-taupe-50 text-taupe-800">
    <template v-if="hydrated">
    <header class="flex items-center justify-between px-5 h-12 border-b border-taupe-200/60 print-hidden">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="size-2 rounded-full bg-taupe-400" />
          <span class="text-sm font-medium text-taupe-700 tracking-tight">Markdown Viewer</span>
        </div>
        <div v-if="fileName" class="flex items-center gap-1.5 pl-3 border-l border-taupe-200">
          <span class="text-xs text-taupe-500">{{ fileName }}</span>
          <button
            v-if="needsReconnect"
            class="text-xs font-medium text-taupe-500 hover:text-taupe-800 hover:bg-taupe-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
            @click="reconnectFile"
          >
            Reconnect
          </button>
          <button
            class="text-taupe-400 hover:text-taupe-600 cursor-pointer transition-colors"
            title="Close file"
            @click="closeFile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <SegmentedControl
          v-model="viewMode"
          :options="viewOptions"
        />
        <button
          class="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-taupe-600 hover:text-taupe-800 hover:bg-taupe-100 transition-colors duration-150 cursor-pointer"
          @click="openFile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
          Open
        </button>
        <button
          class="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-taupe-600 hover:text-taupe-800 hover:bg-taupe-100 transition-colors duration-150 cursor-pointer"
          @click="exportPdf"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
          PDF
        </button>
      </div>
    </header>

    <main class="flex-1 min-h-0">
      <div v-if="viewMode === 'edit'" class="h-full">
        <MarkdownEditor centered />
      </div>

      <div v-else-if="viewMode === 'split'" class="h-full grid grid-cols-2 divide-x divide-taupe-200/60">
        <div class="h-full overflow-hidden">
          <MarkdownEditor />
        </div>
        <div class="h-full overflow-hidden bg-white/40">
          <MarkdownPreview />
        </div>
      </div>

      <div v-else class="h-full bg-white/40">
        <MarkdownPreview centered />
      </div>
    </main>
    </template>
  </div>
</template>
