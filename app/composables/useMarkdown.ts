import { useLocalStorage } from '@vueuse/core'
import { marked } from 'marked'
import { computed, ref, watch } from 'vue'

const defaultMarkdown = `# Welcome to Markdown Viewer

A **minimal** markdown editor with live preview.

## Features

- Three views: **Edit**, **Split**, and **Preview**
- Open files from disk — re-reads on refresh
- Persistent storage — your work is saved automatically
- PDF export via browser print
- Clean taupe design

## Getting Started

Click **Open** in the header to load a .md file from disk, or start typing in the editor.

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

### Code

\`\`\`js
const greeting = 'Hello, world!'
console.log(greeting)
\`\`\`

### Table

| View | Description |
|------|-------------|
| Edit | Full-width markdown editor |
| Split | Side-by-side editor and preview |
| Preview | Rendered markdown only |
`

const DB_NAME = 'markdown-viewer-db'
const DB_VERSION = 1
const STORE_NAME = 'handles'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveHandle(handle: FileSystemFileHandle) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put(handle, 'file')
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadHandle(): Promise<FileSystemFileHandle | null> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const req = tx.objectStore(STORE_NAME).get('file')
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function clearHandle() {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete('file')
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function useMarkdown() {
  const raw = useLocalStorage('markdown-viewer-content', defaultMarkdown)
  const fileHandle = ref<FileSystemFileHandle | null>(null)
  const fileName = ref<string | null>(null)

  const needsReconnect = ref(false)

  const html = computed(() => {
    return marked(raw.value, { async: false }) as string
  })

  function update(value: string) {
    raw.value = value
  }

  async function openFile() {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'Markdown',
        accept: { 'text/markdown': ['.md', '.markdown', '.txt'] },
      }],
      multiple: false,
    })
    fileHandle.value = handle
    fileName.value = handle.name
    needsReconnect.value = false
    await saveHandle(handle)
    await readFile()
  }

  async function readFile() {
    if (!fileHandle.value) return
    const file = await fileHandle.value.getFile()
    raw.value = await file.text()
  }

  async function closeFile() {
    fileHandle.value = null
    fileName.value = null
    needsReconnect.value = false
    raw.value = defaultMarkdown
    await clearHandle()
  }

  async function restoreHandle() {
    const handle = await loadHandle()
    if (!handle) return
    const perm = await handle.queryPermission({ mode: 'read' })
    if (perm === 'granted') {
      fileHandle.value = handle
      fileName.value = handle.name
      await readFile()
    } else {
      fileHandle.value = handle
      fileName.value = handle.name
      needsReconnect.value = true
    }
  }

  async function reconnectFile() {
    if (!fileHandle.value) return
    const perm = await fileHandle.value.requestPermission({ mode: 'read' })
    if (perm === 'granted') {
      needsReconnect.value = false
      await readFile()
    }
  }

  return { raw, html, update, openFile, closeFile, readFile, restoreHandle, reconnectFile, fileHandle, fileName, needsReconnect }
}
