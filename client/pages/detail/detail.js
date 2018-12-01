// pages/detail/detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: {},
    haveComment: true
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
          wx.showToast({
            title: '电影加载失败',
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '电影加载失败',
        })
        setTimeout(()=> {
          wx.navigateBack()
        }, 2000)
      }
    })
  },

  /**
   * 跳转到影评
   */
  onTapShowComment(event) {
    let movieId = event.currentTarget.dataset.id

    wx.navigateTo({
      url: '/pages/comment/comment?movieId=' + movieId,
    })
  },

  /**
   * 跳转到添加影评。传递电影id和评论的类型
   */
  onTapAddComment() {
    let movieId = this.data.movie.id;
    let commentType

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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let movieId = options.id
    this.getMovie(movieId)
  },
})