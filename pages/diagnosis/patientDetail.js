// pages/diagnosis/patientDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: []
  },

  /**
   * 显示图片
   * @param {*} e 
   */
  bindPreviewImage: function(e){
    var current = e.currentTarget.dataset.src;
    console.log(current)
    wx.previewImage({
      current: current,
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var medicinalRecordInfoId = options.id
    app.doctor.getMedicinalRecordInfo(medicinalRecordInfoId).then(res => {
      // 图片取出
      var basePath = app.globalData.basePath
      var prefix = 'file-system/show/'
      var imgList = res.data.fileSystemDetailList
      var imgUrls = []
      for(var i in imgList){
        imgUrls.push(basePath+prefix+imgList[i].id)
      }
      this.setData({
        medicinalRecordInfo: res.data,
        imgUrls
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