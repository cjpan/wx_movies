// client/pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: null,
    movieId: 1,
    userInfo: 'abc',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMovie()
  },

  getMovie() {
    wx.showLoading({
      title: '电影加载中',
    })
    qcloud.request({
      url: config.service.movieDetail + this.data.movieId,
      success: result => {
        wx.hideLoading()
        console.log(result)
        
        let data = result.data
        if (!data.code) {
          this.setData({
            movie: data.data
          })
        } else {
          wx.showToast({
            title: '商品数据加载错误',
          })
        }
      },

      fail: () => {
        wx.hideLoading(),
        wx.showToast({
          title: '商品数据加载错误',
        })
      }
    })
  }, 

  onTapHotImage () {
    let movieId = this.data.movieId;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + movieId,
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})