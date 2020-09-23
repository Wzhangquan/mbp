//index.js
import Event from '../../utils/event.js'
//挂载到wx对象上
wx.event=new Event();
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    background: ['/images/banner.jpg'],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,

    error: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    wx.event.on('ready',()=>{
      console.log('监听到准备就绪跳转')
      wx.hideLoading()
      if(app.globalData.doctorInfo != null && app.globalData.doctorInfo != undefined && app.globalData.doctorInfo != ""){
        wx.switchTab({
          url: '../inquiry/inquiry'
        })
      }
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      app.loginIm()
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })

        var that = this;
        wx.login({
          success: function (res) {
            var code = res.code;//登录凭证
            wx.getUserInfo({
              success: res => {
                var data={
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                  code: code,
                  signature:res.signature,
                  rawData:res.rawData
                }
                that.getUserInfoData(data);
              }
            })
          }
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          var userRes = res;
          wx.login({
            success: function (res) {
              var code = res.code;//登录凭证
              var data={
                encryptedData: userRes.encryptedData,
                iv: userRes.iv,
                code: code,
                signature:userRes.signature,
                rawData:userRes.rawData
              }
              that.getUserInfoData(data);
            }
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log('getUserInfo',e);
    if(e.detail.errMsg.indexOf("ok") == -1){
      return;
    }
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code;//登录凭证
        var data={
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          code: code,
          signature:e.detail.signature,
          rawData:e.detail.rawData
        }
        that.getUserInfoData(data);
      }
    })
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 获取用户信息
   * @param {*} data 
   */
  getUserInfoData:function(data){
    var that = this
    //3.请求服务器，解密用户信息 获取unionId等加密信息
    app.user.login(data).then(res => {
      console.log('用户信息',res)
      app.globalData.userInfo = res
      var openId = res.openId
      app.doctor.getDoctorInfo(openId).then(result => {
        console.log('医生信息',result.data)
        app.globalData.doctorInfo = result.data
        // 登录腾讯云IM
        app.loginIm()
        if(result.data != null && result.data != undefined && result.data != ""){
          wx.showLoading({
            title: 'IM登录中...',
            mask: true
          })
          setTimeout(()=>{
            // 15秒还没跳转，说明登录失败
            if(!app.globalData.isImLogin){
              console.log('IM登录超时')
              that.setData({
                error: 'IM登录超时'
              })
            }
          },15000)
        }
      })
    });
  },

  /**
   * 注册成为医生
   */
  register: function () {
    wx.navigateTo({
      url: '../register/index'
    })
  },
})
