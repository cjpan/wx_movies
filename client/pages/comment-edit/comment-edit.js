// pages/comment-edit/comment-edit.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

const app = getApp();

// 录音授权的状态
const RECORD_UNPROMPTED = 0
const RECORD_UNAUTHORIZED = 1
const RECORD_AUTHORIZED = 2

// 录音的状态
const RECORD_NOT_START = 0
const RECORDING = 1
const RECORD_END = 2

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    movie: null,
    isEditing: true, //编辑状态
    commentType: 'text', //影评类型
    contentValue: [], // 文字影评
    recordAudio: null, // 录音的对象
    recordAuthState: RECORD_UNPROMPTED, //录音授权的状态
    recordState: RECORD_NOT_START, //录音状态
    isPlaying: false // 播放状态
  },

  /**
   * 添加影评的请求
   */
  addComment(movieId, content, audio, duration) {
    wx.showLoading({
      title: '正在发布影评'
    })
    qcloud.request({
      url: config.service.addComment,
      data: {
        movieId,
        content,
        audio,
        duration
      },
      method: 'POST',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            title: '发布影评成功'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/comment/comment?movieId=' + movieId
            })
          }, 2000)
        } else {
          wx.showToast({
            title: '发布影评失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '发布影评失败'
        })
      }
    })
  },

  /**
   * 发布影评，文字和音频分别由不同的数据库column记录，音频还有一个duration column。
   */
  onTapPublish() {
    let movieId = this.data.movie.id
    let content = this.data.contentValue || null    
    let audio = this.data.audio || null
    let duration = this.data.recordAudio ?  this.data.recordAudio.duration : 0
    let commentType = this.data.commentType

    if (commentType === 'audio') {
      this.uploadAudio((audio) => {
        this.addComment(movieId, null, audio, duration)
      })
    } else if (commentType === 'text') { 
      this.addComment(movieId, content, audio, duration)
    }
  },

  /**
   * 重新进入编辑状态
   */
  onTapBack() {
    this.setData({
      isEditing: true
    })
    wx.setNavigationBarTitle({
      title: '编辑影评'
    })
  },

  /**
   * 完成影评编辑，转为预览
   */
  onTapSubmit() {
    this.setData({
      isEditing: false
    })

    wx.setNavigationBarTitle({
      title: '影评预览'
    })
  },

  onInputComment(event) {
    this.setData({
      contentValue: event.detail.value
    })
  },

  onTapLogin() {
    app.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          authState: app.data.authState
        })
      },
      error: () => {
        this.setData({
          authState: app.data.authState
        })
      }
    })
  },

  /**
   * 播放、停止音频文件
   */
  onTapAudio() {
    let isPlaying = this.data.isPlaying

    if (!isPlaying) {
      innerAudioContext.play()
    } else {
      innerAudioContext.pause()
    }

    this.setData({
      isPlaying: !isPlaying
    })
  },

  /**
   * 获取电影详情
   */
  getMovie(id) {
    if (!id) {
      id = 1
    }
    wx.showLoading({
      title: '电影加载中'
    })

    qcloud.request({
      url: config.service.movieDetail + id,
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          this.setData({
            movie: data.data
          })
        } else {
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      },
      fail: () => {
        wx.hideLoading()
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    })
  },

  getRecordAuth() {
    // 获取用户录音授权状态
    wx.getSetting({
      success: (result) => {
        if (!result.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              // 已授权
              this.setData({
                recordAuthState: RECORD_AUTHORIZED
              })
            },
            fail: () => {
              // 未授权
              this.setData({
                recordAuthState: RECORD_UNAUTHORIZED
              })
            }
          })
        } else {
          // 已授权
          this.setData({
            recordAuthState: RECORD_AUTHORIZED
          })
        }
      },
      fail: () => {
      }
    })
  },

  /**
   * 获取必要的权限，开始录音
   */
  startRecord() {
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    if (this.data.recordAuthState === RECORD_UNAUTHORIZED) {
      this.getRecordAuth(true)
    } else if (this.data.recordAuthState === RECORD_AUTHORIZED) {
      recorderManager.onStart(() => {
        wx.vibrateShort() // 震一下
        innerAudioContext.stop() //停止播放
        this.setData({
          recordState: RECORDING,
          recordAudio: null
        })
      })
      recorderManager.start(options) // 开始
    }
  },

  /**
   * 结束录音，保存录音， 获取录音文件路径
   */
  endRecord() {
    recorderManager.stop()
    recorderManager.onStop((res) => {
       res.duration = Math.floor(res.duration / 10) / 100 + '"'
      this.setData({
        recordAudio: res,
        recordState: RECORD_END
      })
      innerAudioContext.src = res.tempFilePath
    })
  },

  /**
   * 上传影评到bucket
   */
  uploadAudio(cb) {
    let url = this.data.recordAudio.tempFilePath;
    wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: url,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: (res) => {
        let content = JSON.parse(res.data).data.imgUrl;
        cb && cb(content)
      },
      fail: () => {
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let commentType = options.commentType
    let movieId = options.movieId
     this.setData({
        movieId,
        commentType
      })

    this.getRecordAuth() // 获取录音授权
    this.getMovie(movieId)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      authState: app.data.authState
    })
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo
        })
      }
    })
  },
})