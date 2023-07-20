import 'tsconfig-paths/register'

;(async () => {
  // add worker app here
    require('./api').start()
})()
