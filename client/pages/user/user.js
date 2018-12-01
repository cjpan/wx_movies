// pages/user/user.js
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
    commentList: [],
    listType: 'favourite'
  },

  /**
   * 跳转到首页
   */
  onTapHome() {
    wx.navigateTo({
      url: '/pages/home/home',
    })
  },

  /**
   * 捕获类型的点击
   */
  onTapListType(event) {
    let listType = event.currentTarget.dataset.type;

    this.setData({
      listType
    })
    this.getComments();
  },

  /**
   * 获取收藏列表
   */
  getFavouriteList(cb) {
    wx.showLoading({
      title: '影评获取中'
    })

    qcloud.request({
      url: config.service.favourite,
      success: result => {
        wx.hideLoading()

        if (!result.data.code) {
          let commentList = result.data.data
          commentList.forEach(comment => {
            comment.duration = Math.floor(comment.duration / 10) / 100 + '"'
          })
          this.setData({
            commentList
          })
        } else {
          wx.showToast({
            title: '影评获取失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '影评获取失败'
        })
      },
      complete: (result) => {
        cb && cb()
      }
    })
  },

  /**
   * 获取本人发布的影评列表
   */
  getMyCommentList(cb) {
    wx.showLoading({
      title: '影评获取中'
    })
    qcloud.request({
      url: config.service.userComment,
      success: (result) => {
        wx.hideLoading()

        if (!result.data.code) {
          let commentList = result.data.data;
          commentList.forEach(comment => {
            comment.duration = Math.floor(comment.duration / 10) / 100 + '"'
          })
          this.setData({
            commentList
          })
        } else {
          wx.showToast({
            title: '影评获取失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '影评获取失败'
        })
      },
      complete: () => {
        cb && cb()
      }
    })
  },

  /**
   * 跳转到影评详情
   */
  onTapComment(event) {
    let commentId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onTapLogin: function () {
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

    this.getComments();
  },

  getComments(cb) {
    if (this.data.listType === 'favourite') {
      this.getFavouriteList(cb);
    } else if (this.data.listType === 'publish') {
      this.getMyCommentList(cb);
    }
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
        this.getComments()
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getComments(() => {
      wx.stopPullDownRefresh();
    });
  },
})