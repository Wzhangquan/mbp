//app.js
var TIM = require('utils/tim-wx')
var COS = require('utils/cos-wx-sdk-v5')
import services from './service/index';
import request from './utils/request';
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    this.iminit();

    // this.loginIm();
  },

  /**
   * 初始化 腾讯IM
   */
  iminit: function() {
    let options = {
      SDKAppID: 1400409491
    }
    var that = this;
    let tim = TIM.create(options);
    tim.setLogLevel(1);
    // 注册 COS SDK 插件
    tim.registerPlugin({'cos-wx-sdk': COS})

    // 监听事件，例如：
    tim.on(TIM.EVENT.SDK_READY, function(event) {
      console.log('SDK_READY');
      wx.event.emit('ready')
      that.globalData.isImLogin = true;
      wx.setStorageSync('isImLogin', true);
    });
  
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
      console.log('APP收到消息');
      // 若同时收到多个会话 需要根据conversationID来判断是哪个人的会话
      var msgarr = [];
      var newMsgForm = event.data[0].conversationID; // 定义会话键值
      if(msgarr[newMsgForm]) {
        msgarr[newMsgForm].push(event.data[0])
      } else {
        msgarr[newMsgForm] = [event.data[0]]
      }
      console.log('APP收到消息',msgarr[newMsgForm])
      that.globalData.myMessages = msgarr
      // 这里引入了一个监听器 （因为小程序没有类似vuex的状态管理器 当global里面的数据变化时不能及时同步到聊天页面 因此 这个监听器可以emit一个方法 到需要更新会话数据的页面 在那里进行赋值）
      wx.event.emit('testFunc',that.globalData.myMessages,newMsgForm) // 详情页的函数
      wx.event.emit('conversation') // 会话列表的监听函数

      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
    })
  
    tim.on(TIM.EVENT.MESSAGE_REVOKED, function(event) {
      // 收到消息被撤回的通知
      // event.name - TIM.EVENT.MESSAGE_REVOKED
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
    });
  
    tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function(event) {
      // 更新当前所有会话列表
      // 注意 这个函数在首次点击进入会话列表的时候也会执行 因此点击消息 可以显示当前的未读消息数（unreadCount表示未读数）
      console.log('APP,更新当前所有会话列表')
      wx.event.emit('unreadCount')

      // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
      // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
      // event.data - 存储 Conversation 对象的数组 - [Conversation]
    });

    tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, function(event) {
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
      wx.event.emit('readByPeer',event.data)
    });
  
    tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function(event) {
      // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
      // event.name - TIM.EVENT.GROUP_LIST_UPDATED
      // event.data - 存储 Group 对象的数组 - [Group]
    });
  
    tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, function(event) {
      // 收到新的群系统通知
      // event.name - TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED
      // event.data.type - 群系统通知的类型，详情请参见 GroupSystemNoticePayload 的 operationType 枚举值说明
      // event.data.message - Message 对象，可将 event.data.message.content 渲染到到页面
    });
  
    tim.on(TIM.EVENT.PROFILE_UPDATED, function(event) {
      // 收到自己或好友的资料变更通知
      // event.name - TIM.EVENT.PROFILE_UPDATED
      // event.data - 存储 Profile 对象的数组 - [Profile]
    });
  
    tim.on(TIM.EVENT.BLACKLIST_UPDATED, function(event) {
      // 收到黑名单列表更新通知
      // event.name - TIM.EVENT.BLACKLIST_UPDATED
      // event.data - 存储 userID 的数组 - [userID]
    });
  
    tim.on(TIM.EVENT.ERROR, function(event) {
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
    });
  
    tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
      console.log('SDK_NOT_READY')
      that.globalData.isImLogin = false
      wx.setStorageSync('isImLogin', false)
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
    });
  
    tim.on(TIM.EVENT.KICKED_OUT, function(event) {
      console.log('KICKED_OUT')
      wx.setStorageSync('isImLogin', false)
      that.globalData.isImLogin = false
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢
    })
    that.globalData.tim = tim
  },

   /**
    * 腾讯云IM 登录
    */
   loginIm: function() {
    var that = this
    // 用户openid
    var userId = that.globalData.userInfo.openId

    var data = {user: userId}
    this.user.getUserSig(data).then(userSig => {
      var tim = that.globalData.tim
      let promise = tim.login({userID: userId, userSig: userSig});
      promise.then(function(imResponse) {
        console.log('APP初始化时，IM登录成功')
      }).catch(function(imError) {
        console.warn('login error:', imError); // 登录失败的相关信息
      })
    })
  },

  globalData: {
    userInfo: null,
    doctorInfo: null,
    tim: '',
    isImLogin: false,
    msgList: [],
    myMessages: new Map(),
    tabBottom: 0, // 全面屏底部黑条高度
    accountTid: '', //当前用户的tid
    isDetail: true,
    basePath: 'https://testenv.lothz.com/yzt/'
    // basePath: 'http://localhost:8091/yzt/'
  },
  ...services,
  ...request
})