// pages/diagnosis/diagnosis.js
import Event from '../../utils/event.js'
//挂载到wx对象上
wx.event=new Event();

var TIM = require('../../utils/tim-wx')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myMessages: [],//消息
    scrollTop: 0,
    height:'',
    complete:0,//默认为有历史记录可以拉取
    is_lock:true,//发送消息锁,
    userSign: '',
    userId: '', // 自己的id
    conversationID: '', // 要发送对象的id
    msgList: app.globalData.msgList,
    friendAvatarUrl: '',
    tabBottom: app.globalData.tabBottom,
    top_height: app.globalData.height,
    isCompleted: false,
    nextReqMessageID: '',
    more_text: '下拉查看更多历史信息',
    isDetail: false,
    inputHeight: 0,
    sendShow: false,
    inputVal: '',
    showIcon: false
  },

  /**
   * 病患详情
   */
  toDetail: function() {
    wx.navigateTo({
      url: 'patientDetail?id=' + this.data.medicinalRecordInfo.id
    })
  },

  /**
   * 前往开处方
   */
  goPrescription: function(){
    wx.navigateTo({
      url: '../prescription/prescription?id=' + this.data.medicinalRecordInfo.id
    })
  },

  /**
   * 结束会诊
   */
  overDiagnosis: function(){
    var id = this.data.medicinalRecordInfo.id
    var version = this.data.medicinalRecordInfo.modifyTimestamp
    app.doctor.changeDiagnoseFlag(id,'3',version).then(res => {
      if(res.success){
        wx.navigateBack();
      }else{
        this.setData({error: res.message})
      }
    })
  },

  /**
   * 点击加号展开更多功能
   */
  showIcon: function(){
    var iconFlg = this.data.showIcon;
    this.setData({
      showIcon: !iconFlg
    })
    this.pageScrollToBottom()
  },

  /**
   * 点击聊天界面
   */
  bindChatClick:function(){
    this.setData({showIcon: false})
    this.pageScrollToBottom()
  },

  focusText: function(){this.setData({focus: true})},

   /**
   * 获取聚焦
   */
  focus: function(e) {
    var inputHeight = 0
    if (e.detail.height) {
      inputHeight = e.detail.height
    }
    this.setData({
      inputHeight: inputHeight,
      sendShow: true
    })
    this.pageScrollToBottom()
  },

  /**
   * 失去聚焦(软键盘消失)
   */ 
  blur: function(e) {
    this.setData({
      inputHeight: 0
    })
    if(this.data.inputVal == ''){
      this.setData({
        sendShow: false
      })
    }
    wx.hideKeyboard()
  },

  /**
   * 输入框输入事件
   * @param {*} e 
   */
  input: function(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },

  /**
   * 退回上一页
   */
  toBackClick: function() {
    wx.navigateBack({})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中...',
      icon: 'none'
    })
    app.doctor.getMedicinalRecordInfo(options.id).then(res => {

      console.log('病患详情',res.data)
      that.setData({
        conversationID: 'C2C' + res.data.weixinOpenid,
        isDetail: true,
        cusHeadIcon: res.data.weixinHeadUrl,
        friendAvatarUrl: res.data.weixinHeadUrl,
        medicinalRecordInfo: res.data,
      })

      if(app.globalData.isImLogin) {
        console.log('已登录')
        // 获取消息列表
        that.getMsgList()
      } else {
        console.log('未登录')
        // that.getPassword()
      }
      // 滚动到底部
      that.pageScrollToBottom()
    })
    // 监听消息接收
    wx.event.on('testFunc',(e,newMsgForm)=>{
      console.log('监听消息接收')
      if((newMsgForm === that.data.conversationID) && app.globalData.isDetail) {
        var newmsg = app.globalData.myMessages[that.data.conversationID]
        if (newmsg) {
          newmsg.forEach(e => {
            if(e.type == 'TIMCustomElem') {
              if(typeof(e.payload.data) == 'string' && e.payload.data) {
                var new_data = JSON.parse(e.payload.data)
                e.payload.data = new_data
              }
            }
            if(!e.isRead) {
              that.setData({
                myMessages: that.data.myMessages.concat(newmsg)
              })
            }
          })
        }
        // 设置已读
        that.setMessageRead()
        // 滚到最下面
        that.pageScrollToBottom()
      }
    })

    // 监听已读
    wx.event.on('readByPeer',(data)=>{
      console.log('对方已读')
      // 取最近对方已读的消息
      var msg;
      for(var index in data){
        if((data[index].conversationID === that.data.conversationID) && app.globalData.isDetail) {
          msg = data[index];
        }
      }
      var msgList = that.data.myMessages;
      // 设置已读至最近对方已读消息
      for(var index in msgList){
        if(!msgList[index].isPeerRead){
          msgList[index].isPeerRead = true;
        }
        if(msgList[index].ID === msg.ID){
          that.setData({
            myMessages: msgList
          })
          break;
        }
      }
    })
  },

  /**
   * 监听收到的消息
   */
  watch:{
    myMessages: function(newVal,oldVal){
      console.log(newVal,oldVal)
    },
    inputVal: function(newVal, oldVal){
      if(newVal === ''){
        this.setData({sendShow:false})
      }else{
        this.setData({sendShow:true})
      }
    }
  },

  /**
   * 获取腾讯云IM key（腾讯云登录）
   */
  getPassword() {
    var that = this
    that.setData({
      userSign: 'eJyrVgrxCdZLrSjILEpVsjI0NTU1MjAw0AGLlqUWKVkpGekZKEH4xSnZiQUFmSlAdSYGBiYGliaWhhCZzJTUvJLMtEywhtLi1CK4lsx0oEi*u4V2WpFzpJ95qVlBkmOae7aJZ2mUZbqxS2VKSFVuhblLWmK4iWFpYKqvLVRjSWYu2D2WZmZGBoaGRrUAKYkxOg__',
      userId: 'user0'
    })
    // 当前腾讯云登录用户
    app.globalData.accountTid = 'user0'

    // 登录腾讯云
    var tim = app.globalData.tim
    let promise = tim.login({userID: 'user0', userSig: 'eJyrVgrxCdZLrSjILEpVsjI0NTU1MjAw0AGLlqUWKVkpGekZKEH4xSnZiQUFmSlAdSYGBiYGliaWhhCZzJTUvJLMtEywhtLi1CK4lsx0oEi*u4V2WpFzpJ95qVlBkmOae7aJZ2mUZbqxS2VKSFVuhblLWmK4iWFpYKqvLVRjSWYu2D2WZmZGBoaGRrUAKYkxOg__'})
    promise.then(res => {
      console.log('登录成功')
      wx.setStorageSync('isImLogin', true)
      app.globalData.isImLogin = true

      // 拉取消息列表
      setTimeout(() => {
        that.getMsgList()
      }, 1000);
    })
  },

  /**
   * 拉取消息列表
   */
  getMsgList() {
    console.log('获取会话列表')
    var that = this
    var tim = app.globalData.tim

    // 拉取会话列表
    var params = {
      conversationID: that.data.conversationID, 
      count: 15,
      nextReqMessageID: that.data.nextReqMessageID
    }
    let promise = tim.getMessageList(params);
    promise.then(function(imResponse) {
      const messageList = imResponse.data.messageList; // 消息列表。
      // 处理自定义的消息
      messageList.forEach(e => {
        if(e.type == 'TIMCustomElem') {
          if(typeof(e.payload.data) == 'string' && e.payload.data) {
            var new_data = JSON.parse(e.payload.data)
            e.payload.data = new_data
          }
        }
      })
      console.log('会话消息',messageList)
      const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
      const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。
      // 将某会话下所有未读消息已读上报
      that.setMessageRead()
      that.setData({
        myMessages: messageList,
        isCompleted: isCompleted,
        nextReqMessageID: nextReqMessageID,
        more_text: isCompleted ? '没有更多了': '下拉查看更多历史信息'
      })
      // 关闭加载中弹窗
      wx.hideLoading()
      // 滚到最底下
      that.pageScrollToBottom()
    }).catch(function(imError) {
      console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
  },

  /**
   * 下拉加载更多聊天历史记录
   */ 
  getMoreMsgList() {
    console.log('加载更多聊天历史记录')
    var tim = app.globalData.tim
    var that = this
    // 拉取会话列表
    var params = {
      conversationID: that.data.conversationID, 
      count: 10,
      nextReqMessageID: that.data.nextReqMessageID
    }
    let promise = tim.getMessageList(params);
    promise.then(function(imResponse) {
      // 处理自定义的消息
      imResponse.data.messageList.forEach(e => {
        if(e.type == 'TIMCustomElem') {
          if(e.payload.data) {
            var new_data = JSON.parse(e.payload.data)
            e.payload.data = new_data
          }
        }
      })
      const messageList = imResponse.data.messageList.concat(that.data.myMessages); // 消息列表。
      const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
      const isCompleted = imResponse.data.isCompleted; // 表示是否已经拉完所有消息。
      that.setData({
        myMessages: messageList,
        isCompleted: isCompleted,
        nextReqMessageID: nextReqMessageID,
        more_text: isCompleted ? '没有更多了': '下拉查看更多历史信息'
      })
      // 关闭加载中弹窗
      wx.hideLoading()
    }).catch(function(imError) {
      console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
  },

  /**
   * 设置已读上报
   */
  setMessageRead() {
    var tim = app.globalData.tim
    var that = this
    let promise = tim.setMessageRead({conversationID: that.data.conversationID})
    promise.then(function(imResponse) {
      // 已读上报成功
      var noready = 0
      that.data.myMessages.forEach(e => {
        if(!e.isRead) {
          noready++
        }
      })
      var number = wx.getStorageSync('number_msg')
      var newNumber = number - noready
      wx.setStorageSync('number_msg', newNumber)
    }).catch(function(imError) {
      // 已读上报失败
      console.warn('setMessageRead error:', imError);
    })
  },

  /**
   * 发送普通文本消息
   * @param {*} e 
   */
  bindConfirm(e) {
    var that = this;
    if(that.data.is_lock){
      that.setData({
        is_lock:false
      })
      if (that.data.inputVal.length == 0) {
        wx.showToast({
          title: '消息不能为空!',
          icon:'none'
        })
        that.setData({
          is_lock: true
        })
        return;
      }
      var content = {
        text: that.data.inputVal
      };
      var tim = app.globalData.tim
      var options = {
        to: that.data.conversationID.slice(3), // 消息的接收方
        conversationType: TIM.TYPES.CONV_C2C, // 会话类型取值TIM.TYPES.CONV_C2C或TIM.TYPES.CONV_GROUP
        payload: content // 消息内容的容器
      }
      // // 发送文本消息，Web 端与小程序端相同
      // 1. 创建消息实例，接口返回的实例可以上屏
      let message = tim.createTextMessage(options)
      // 2. 发送消息
      let promise = tim.sendMessage(message)
      promise.then(function(imResponse) {
        // 发送成功
        var messageList = that.data.myMessages
        messageList.push(imResponse.data.message)
        that.setData({
          is_lock: true,
          myMessages: messageList,
          sendShow: false,
          showIcon: false
        })
        that.pageScrollToBottom()
        that.clearInput()
      }).catch(function(imError) {
        // 发送失败
        console.warn('sendMessage error:', imError);
      })
    }
  },

  /**
   * 清除输入框
   * @param {*} e 
   */
  clearInput(e){
    this.setData({
      inputVal:''
    })
  },

  /**
   * 发送图片信息
   */
  sendImageMessage: function(){
    var that = this;
    // 1. 选择图片
    wx.chooseImage({
      sourceType: ['album','camera'], // 从相册选择
      count: 1, // 只选一张，目前 SDK 不支持一次发送多张图片
      success: function (res) {
        // 2. 创建消息实例，接口返回的实例可以上屏
        var tim = app.globalData.tim
        let message = tim.createImageMessage({
          to: that.data.conversationID.slice(3),
          conversationType: TIM.TYPES.CONV_C2C,
          payload: { file: res },
          onProgress: function(event) { console.log('file uploading:', event) }
        });
        // 3. 发送图片
        let promise = tim.sendMessage(message);
        promise.then(function(imResponse) {
          // 发送成功
          console.log('图片发送成功');
          var messageList = that.data.myMessages
          messageList.push(imResponse.data.message)
          that.setData({
            myMessages: messageList
          })
          that.pageScrollToBottom()
        }).catch(function(imError) {
          // 发送失败
          console.warn('sendMessage error:', imError);
        });
      }
    })
  },

  /**
   * 查看图片
   * @param {*} e 
   */
  previewImage: function(e){
    var current = e.currentTarget.dataset.src;
    console.log(current)
    wx.previewImage({
      current: current,
      urls: [current] // TODO 有空可以把所有聊天记录的图片文件放进list
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.globalData.isDetail = true
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
  	// 关闭聊天界面的时候需要把当前聊天界面的监听器关闭 否则会一直监听着 在其他页面出现调用多次的问题
    wx.event.off("testFunc")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    console.log('加载更多')
    if(!that.data.isCompleted) {
      wx.showLoading({
        title: '加载历史记录中...',
        icon: 'none'
      })
      // 加载更多消息
      that.getMoreMsgList()
    } else {
      wx.showToast({
        title: '没有更多历史记录了',
        icon:'none'
      })
    }
    setTimeout(() => {
      wx.stopPullDownRefresh(true)
    }, 300);
  },

  /**
   * 滚到最底下
   */
  pageScrollToBottom() {
    wx.createSelectorQuery().select('#chat').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        selector: '#chat',
        scrollTop: rect ? rect.height : 0,
        duration: 0
      })
    }).exec()
  }
})