import { app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

function update () {
  autoUpdater.autoDownload = false
  if (is.dev) {
    Object.defineProperty(app, 'isPackaged', {
      get() {
        return true
      }
    })
    autoUpdater.updateConfigPath = join(__dirname, '../../dev-app-update.yml')
    autoUpdater.checkForUpdates()
  } else {
    autoUpdater.checkForUpdatesAndNotify()
  }

  autoUpdater.on('error', error => {
    dialog.showErrorBox('Error', error === null ? 'unknown' : (error.stack))
  })

  autoUpdater.on('checking-for-update', (info) => {
    console.log('Checking for update...', info)
  })

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用有新的版本',
      message: '发现新版本，是否现在更新？',
      buttons: ['是', '否']
    }).then(res => {
      if (res.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })

  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      title: '没有新版本',
      message: '当前已经是最新版本',
      buttons: ['是', '否']
    })
  })

  autoUpdater.on('download-progress', progressObj => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond} - Download ${progressObj.percent} (${progressObj.transferred}/${progressObj.total})`
    console.log(logMessage)
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
    }).then(() => {
      setImmediate(() => autoUpdater.quitAndInstall())
    })
  })
}

export default update
