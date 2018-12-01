// pages/comment/comment.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

const _ = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentList: [],
    movieId: null,
  },

  /**
   * 获取该影片的影评列表
   */
  getCommentList(movieId, cb) {
    qcloud.request({
      url: config.service.commentList + '?movieId=${movieId}',
      data: {
        movieId
      },
      success: result => {
        if (!result.data.code) {
          let commentList = result.data.data
          commentList.forEach(comment => {
            comment.duration = Math.floor(comment.duration / 10) / 100 + '"' // 保留2位小数
          })
          this.setData({
            commentList
          })
        }
      },
      fail: (e) => {
        console.log(e)
      },
      complete: () => {
        cb && cb()
      }
    })
  },

  /**
   * 跳转到点击的影评详情
   */
  onTapComment(event) {
    let commentId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },

  /**
   * 回到首页
   */
  onTapHome() {
    wx.navigateTo({
      url: '/pages/home/home',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let movieId = options.movieId
    this.getCommentList(movieId)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getCommentList(this.data.movieId, () => {
      wx.stopPullDownRefresh();
    })
  },
})