// pages/inquiry/inquiry.js
import Event from '../../utils/event.js'
//挂载到wx对象上
wx.event=new Event();

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    tim: null
  },

  /**
   * 跳转到诊断
   * @param e 
   */
  goDiagnosis: function(e){
    var id = e.currentTarget.dataset.id;
    var diagnoseFlag = e.currentTarget.dataset.diagnoseflag
    var index = e.currentTarget.dataset.index
    var version = e.currentTarget.dataset.version
    if(diagnoseFlag === '1'){
      app.doctor.changeDiagnoseFlag(id,'2',version)
    }
    wx.navigateTo({
      url: '../diagnosis/diagnosis?id=' + id
    })
  },

  /**
   * 未读消息条数
   */
  unreadCount: function () {
    var that = this;
    var tim = this.data.tim;
    var promise = tim.getConversationList();
    var list = this.data.list;
    promise.then(function(res){
      // 会话集合
      var conversationList = res.data.conversationList;
      for(var i in conversationList){
        for(var j in list){
          var conversationID = 'C2C' + list[j].weixinOpenid;
          if(conversationList[i].conversationID === conversationID){
            console.log(list[j].currentPatientName + '有' + conversationList[i].unreadCount + '条未读消息')
            list[j].unreadCount = conversationList[i].unreadCount
          }
        }
      }
      that.setData({
        list: list
      })
    })
  },

  /**
   * 未读消息总数
   */
  unread: function () {
    console.log('未读消息总数')
    var tim = this.data.tim;
    var promise = tim.getConversationList();
    var list = this.data.list;
    var unread = 0;
    promise.then(function(res){
      // 会话集合
      var conversationList = res.data.conversationList;
      for(var i in conversationList){
        for(var j in list){
          var conversationID = 'C2C' + list[j].weixinOpenid;
          if(conversationList[i].conversationID === conversationID){
            unread = unread + conversationList[i].unreadCount;
          }
        }
      }
      if (unread != 0) {
        wx.setTabBarBadge({
          index: 0,
          text: unread > 99? '99+' : unread + ''
        })
      }else {
        wx.removeTabBarBadge({
          index: 0,
        })
      }
    })
  },

  /**
   * 初始化加载数据
   */
  initData: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    app.doctor.getMedicinalRecordList(app.globalData.doctorInfo.id).then(res => {
      
      var list = res.data
      console.log('问诊列表',list)
      for(var index in list){
        switch(list[index].diagnoseFlag){
          case '1': list[index].diagnoseFlagNm = '未诊断';list[index].statusClass = 'will';break;
          case '2': list[index].diagnoseFlagNm = '诊断中';list[index].statusClass = 'ing';break;
          case '3': list[index].diagnoseFlagNm = '诊断结束';list[index].statusClass = 'end';break;
          case '4': list[index].diagnoseFlagNm = '退诊';list[index].statusClass = 'end';break;
        }
        switch(list[index].hasHospital){
          case '1': list[index].hasHospital = '就诊过';break;
          case '2': list[index].hasHospital = '没就诊过';break;
        }
      }

      this.setData({
        list: list,
      })

      // 初期加载获取未读消息条数
      this.unreadCount();
      this.unread();

      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tim: app.globalData.tim
    })

    // 监听获取未读消息条数
    wx.event.on('unreadCount',()=>{
      console.log('问诊台监听未读消息')
      this.unreadCount();
      this.unread();
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
    this.initData()
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
    console.log('更新问诊列表')
    this.initData()
    setTimeout(() => {
      wx.stopPullDownRefresh(true)
    }, 300);
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