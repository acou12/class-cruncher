import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      loadHeaders: (headers: string) => void
      getCourses: (courses: string[]) => string[]
    }
  }
}
