// pages/mine/myPrescription.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    limit:3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    app.myPrescription.getPrescriptionList(getApp().globalData.doctorInfo.id,that.data.page,that.data.limit).then(res => {
      console.log('我的处方', res)
      that.setData({
        myPrescriptionList:res.rows
      })
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
    var that = this
    that.setData({page:1})
    app.myPrescription.getPrescriptionList(getApp().globalData.doctorInfo.id,that.data.page,that.data.limit).then(res => {
      console.log(res)
      that.setData({
        myPrescriptionList:res.rows
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    that.setData({page:that.data.page+1})
    app.myPrescription.getPrescriptionList(getApp().globalData.doctorInfo.id,that.data.page,that.data.limit).then(res => {
      that.setData({
        myPrescriptionList: that.data.myPrescriptionList.concat(res.rows)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})