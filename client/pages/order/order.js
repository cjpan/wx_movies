// pages/order/order.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    authType: app.data.authType, 
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getOrder() {
    wx.showLoading({
      title: '订单数据获取中...'
    })

    qcloud.request({
      url: config.service.orderList,
      login: true,
      success: result => {
        wx.hideLoading()

        let data = result.data
        console.log(data)
        if (!data.code) {
          this.setData({
            orderList: data.data
          })
        } else {
          wx.showToast({
            title: '订单获取失败'
          })
          console.log(result)
        }
      },
      fail: (result) => {
        wx.hideLoading()
        console.log(result)
        wx.showToast({
          title: '订单获取失败',
        })
      }
    })
  },

  onTapLogin: function() {
    app.login({
      success: ({userInfo}) => {
        this.setData({
          userInfo,
          authType: app.data.authType
        })
      },
      error: () => {
        this.setData({
          authType: app.data.authType
        })
      }
    })
    this.getOrder()
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
    //同步授权状态
    this.setData({
      authType: app.data.authType
    })
    app.checkSession({
      success: ({userInfo}) => {
        this.setData({
          userInfo
        })
        this.getOrder()
      }
    })
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