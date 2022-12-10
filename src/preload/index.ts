import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type Api = {
  loadHeaders: (headers: string) => Promise<void>
  getCourses: (courses: string[]) => Promise<string[]>
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      loadHeaders: (headers: string) => ipcRenderer.invoke('loadHeaders', headers),
      getCourses: (courses: string[]) => ipcRenderer.invoke('getCourses', courses)
    } as Api)
  } catch (error) {
    console.error(error)
  }
}
