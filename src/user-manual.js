import { $ } from './utils.js'

$("#closeManual").addEventListener("click", () => {
    window.electronAPI.closeApp()
})