import { screen } from 'electron'
import settings from 'electron-settings'
import { BrowserWindow } from 'electron/main'
import { WindowState } from './types'

export class WindowStateKeeper {
  public windowState: WindowState

  private browserWindow!: BrowserWindow

  constructor(private windowName: string) {
    this.windowState = {} as WindowState
  }

  private get settingsName() {
    return `WindowStateKeeper.windowState.${this.windowName}`
  }

  public restoreWindowPosition = async () => {
    if (await settings.has(this.settingsName)) {
      this.windowState = await settings.get(this.settingsName) as WindowState
      return
    }

    const size = screen.getPrimaryDisplay().workAreaSize

    this.windowState = {
      x: undefined,
      y: undefined,
      width: size.width / 2,
      height: size.height / 2,
    }
  }

  private saveState = async () => {
    if (!this.windowState.isMaximized) {
      this.windowState = this.browserWindow.getBounds() as WindowState
    }
    this.windowState.isMaximized = this.browserWindow.isMaximized()
    await settings.set(this.settingsName, this.windowState)
  }

  public track = async (win: BrowserWindow) => {
    this.browserWindow = win
    const saveState = this.saveState.bind(this)
    this.browserWindow.on('resize', saveState)
    this.browserWindow.on('move', saveState)
    this.browserWindow.on('close', saveState)
  }
}
