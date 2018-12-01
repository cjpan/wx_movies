// client/pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    authState: app.data.authState,
    comment: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onTapLogin() {
    app.login({
      success: ({userInfo}) => {
        this.setData({
          userInfo,
          authState: app.data.authState
        })
      },
      error: (e) => {
        console.log(e)
        this.setData({
          authState: app.data.authState
        })
      }
    })
    this.getRecommendation()
  },

  /**
   * 获取推荐电影
   */
  getRecommendation() {
    wx.showLoading({
      title: '电影加载中',
    })
    qcloud.request({
      url: config.service.commentRecommend,
      success: result => {
        wx.hideLoading()
        
        let data = result.data
        if (!data.code) {
          this.setData({
            comment: data.data
          })
        } else {
          wx.showToast({
            title: '电影加载错误',
          })
        }
      },

      fail: (e) => {
        console.log(e)
        wx.hideLoading(),
        wx.showToast({
          title: '电影加载错误',
        })
      }
    })
  }, 

  /**
   * 跳转到电影详情页
   */
  onTapHotImage () {
    let movieId = this.data.comment.movieId;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + movieId,
    })
  },

  /**
   * 跳转到影评详情页
   */
  onTapComment() {
    let commentId = this.data.comment.commentId
    console.log(this.data.comment)
    wx.navigateTo({
      url: '/pages/comment-detail/comment-detail?commentId=' + commentId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      authState: app.data.authState
    })
    app.checkSession({
      success: ({userInfo}) => {
        this.setData({
          userInfo
        })
        this.getRecommendation()
      }
    })
  },

})