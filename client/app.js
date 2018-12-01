//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

let userInfo

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2


App({
  onLaunch: function () {
    qcloud.setLoginUrl(config.service.loginUrl)
  },

  data: {
    authState: UNPROMPTED
  },

  login ({success, error}) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {
          this.data.authState = UNAUTHORIZED

          wx.showModal({
            title: '提示',
            content: '请授权获取用户信息',
            showCancel: false
          })

          error && error()
        } else {
          this.data.authState = AUTHORIZED
          this.doQcloudLogin({success, error})
        }
      },
      fail: (result) => {
        console.log(result)
      }
    })
  }, 

  doQcloudLogin({success, error}) {
    qcloud.login({
      success: result => {
        if (result) {
          let userInfo = result
          success && success({
            userInfo
          })
        } else {
          this.getUserInfo({success, error})
        }
      },
      fail: (e) => {
        error && error()
      }
    })
  },

  getUserInfo({success, error}) {
    if (userInfo) {
      return userInfo
    }

    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success: result => {
        let data = result.data
        if (!data.code) {
          let userInfo = data.data

          success && success({
            userInfo
          })
        } else {
          error && error()
        }
      },
      fail: () => {
        error && error()
      } 
    })
  },

  checkSession({success, error}) {
    if (userInfo) {
      return success && success({
        userInfo
      })
    }

    wx.checkSession({
      success: () => {
        this.getUserInfo({
          success: res => {
            userInfo = res.userInfo

            success && success({
              userInfo
            })
          },
          fail: (res) => {
            console.log(res)

            error && error()
          }
        })
      },
      fail: () => {
        error && error()
      }
    })
  }
})