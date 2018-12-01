// pages/comment-detail/comment-detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

const app = getApp()

const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: null,
    userComments: [],
    userInfo: null,
    isPlaying: false, // 音频播放状态
  },

  /**
   * 根据commentId, 获取相应的影评详情
   */
  getCommentDetail(commentId) {
    wx.showLoading({
      title: '影评获取中',
    })
    qcloud.request({
      url: config.service.commentDetail + commentId,
      success: result => {
        wx.hideLoading()
        if (!result.data.code) {
          let comment = result.data.data
          comment.duration = Math.floor(comment.duration / 10) / 100 + '"' //保留2位小数
          this.setData({
            comment
          })
          innerAudioContext.src = this.data.comment.audio
          let movieId = comment.movieId
          this.getUserComments(movieId)
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '获取影评失败',
          })
        }
      },
      fail: e => {
        console.log(e)
        wx.showToast({
          title: '获取数据错误',
        })
      }
    })
  },

  /**
   *  获取本人的电影相应的影评详情
   */
  getUserComments(movieId) {
    qcloud.request({
      url: config.service.userComment + `?movieId=${movieId}`,
      success: (result) => {
        if (!result.data.code) {
          this.setData({
            userComments: result.data.data
          })
        } else {
          wx.showToast({
            title: '获取用户影评失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          title: '获取用户影评失败'
        })
      }
    });
  },

  /**
   * 跳转到个人影评的一条详情
   */
  onTapMyComment() {
    let commentId = this.data.userComments[0].commentId;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`
    })
  },

  /**
   * 设置播放状态并播放、停止
   */
  onTapAudio() {
    let isPlaying = this.data.isPlaying
    if (isPlaying) {
      innerAudioContext.pause()
    } else {
      innerAudioContext.play()
    }
    this.setData({
      isPlaying: !isPlaying
    })
  },

  /**
   * 编辑影评
   */
  onTapEditComment() {
    let movieId = this.data.comment.movieId;
    let commentType = ''
    
    wx.showActionSheet({
      itemList: ['文字', '音频'],
      success: res => {
        if (res.tapIndex === 0) {
          commentType = 'text'
        } else {
          commentType = 'audio'
        }
        wx.navigateTo({
          url: `/pages/comment-edit/comment-edit?movieId=${movieId}&commentType=${commentType}`,
        })
      }
    })
  },

  /**
   * 收藏、取消收藏
   */
  onTapStar() {
    let commentId = this.data.comment.commentId
    let action = this.data.comment.favId ? 'unstar' : 'star' //收藏和取消收藏的动作

    wx.showLoading({
      title: '',
    })

    qcloud.request({
      url: config.service.updateFavourite,
      method: 'POST',
      data: {
        commentId,
        action
      },
      success: result => {
        wx.hideLoading()
        this.getCommentDetail(commentId)
        if (!result.data.code) {
          wx.showToast({
            title: '已收藏',
          })
        } else {
          wx.showToast({
            title: '收藏失败',
          })
        }
      },
      fail: e => {
        console.log(e)
        wx.hideLoading()

        wx.showToast({
          title: '收藏失败',
        })
      }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let commentId = options.commentId
    this.getCommentDetail(commentId)
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