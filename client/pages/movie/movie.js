// pages/movie/movie.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList:[]
  },

  /**
   * 电影列表
   */
  getMovieList(cb) {
    wx.showLoading({
      title: '电影加载中',
    })

    qcloud.request({
      url: config.service.movieList,
      success: (result) => {
        wx.hideLoading()

        let data = result.data
        if (!data.code) {
          this.setData({
            movieList: data.data
          })
        } else {
          wx.showToast({
            title: '电影加载错误',
          })
        }
      },

      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '电影加载错误',
        })
      },

      complete: () => {
        wx.hideLoading()
        cb && cb()
      }
    })    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMovieList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getMovieList(() => {
      wx.stopPullDownRefresh();
    })
  },
})