const path = require('path')
const AdmZip = require('adm-zip')
const fse = require('fs-extra')

exports.default = async function(context) {
  // let targetPath
  // if(context.packager.platform.nodeName === 'darwin') {
  //   targetPath = path.join(context.appOutDir, `${context.packager.appInfo.productName}.app/Contents/Resources`)
  // } else {
  //   targetPath = path.join(context.appOutDir, './resources')
  // }

  // const distFolder = path.join(targetPath, './app/dist')
  // const electronDistFolder = path.join(targetPath, './app/dist-electron')

  // const targetFolder = path.join(targetPath, 'update-pack')

  // const targetElectronDistFolder = path.join(targetFolder, 'dist-electron')
  // const targetDistFolder = path.join(targetFolder, 'dist')

  // if (fse.existsSync(targetFolder)) {
  //   fse.rmdirSync(targetFolder)
  // }


  // fse.mkdirSync(targetElectronDistFolder, { recursive: true })
  // fse.mkdirSync(targetDistFolder, { recursive: true })
  // fse.copySync(distFolder, targetDistFolder)
  // fse.copySync(electronDistFolder, targetElectronDistFolder)

  // var zip = new AdmZip()
  // zip.addLocalFolder(targetFolder)
  // zip.writeZip(path.join(context.outDir, `update-pack.zip`))
}