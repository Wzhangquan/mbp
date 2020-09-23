// pages/prescription/prescription.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    // 错误信息
    error: '',
    // 选好的药品
    selectedList: [],
    // 消息弹窗
    msgDialogShow: false,
    // 消息弹窗按钮
    msgButtons: [{text: '取消'}, {text: '确定'}],
    // 消息弹窗类型 1：列表减号按钮按下后触发的  2：确定按钮按下后触发的
    msgType: 1
  },

  /**
   * 列表点击减号
   */
  bindMinusWithOrder: function(e) {
    var index = e.currentTarget.dataset.index;
    var selectedList = this.data.selectedList;
    if (selectedList[index].num > 1) {
      selectedList[index].num--;
    }else{
      // 当前要删除药品的下标
      this.setData({
        delPreIndex: index
      })
      this.openMsgConfirm(1,'确定不要了吗？');
    }
    this.setData({
      selectedList: selectedList
    })
  },
  /**
   * 列表点击加号
   */
  bindPlusWithOrder: function(e) {
    var index = e.currentTarget.dataset.index;
    var selectedList = this.data.selectedList;
    selectedList[index].num++;
    this.setData({
      selectedList: selectedList
    })
  },
  /**
   * 打开消息弹窗
   * @param {*} type 
   * @param {*} msgText 
   */
  openMsgConfirm: function (type,msgText) {
    this.setData({
      msgDialogShow: true,
      msgType: type,
      msgText: msgText
    })
  },
  /**
   * 消息弹窗按钮
   * @param {*} e 
   */
  msgDialogButton(e) {
    this.setData({
      msgDialogShow: false
    })
    var type = this.data.msgType;
    if(e.detail.index == 1){
      if(type == 1){
        var index = this.data.delPreIndex;
        var list = this.data.selectedList;
        list.splice(index,1);
        this.setData({
          selectedList: list
        })
        wx.setStorage({
          data: list,
          key: 'orderList',
        })
      }else if(type == 2){
        console.log('提交处方')
        // 提交处方
        this.commitForm()
      }
    }
  },
  
  /**
   * 提交处方表
   */
  commitForm: function(){
    var medicinalRecordInfo = this.data.medicinalRecordInfo
    var selectedList = this.data.selectedList
    var that = this
    var prescriptionDetailInfoList = []
    var prescriptionInfo = {
      patientId: medicinalRecordInfo.patientId,
      patientCode: medicinalRecordInfo.patientCode,
      patientName: medicinalRecordInfo.patientName,
      doctorId: medicinalRecordInfo.doctorId,
      doctorCode: medicinalRecordInfo.doctorCode,
      doctorName: medicinalRecordInfo.doctorName,
      currentPatientId: medicinalRecordInfo.currentPatientId,
      currentPatientCode: medicinalRecordInfo.currentPatientCode,
      currentPatientName: medicinalRecordInfo.currentPatientName,
      medicalRecordId: medicinalRecordInfo.id,
      pharmacyCode: medicinalRecordInfo.pharmacyCode,
      pharmacyName: medicinalRecordInfo.pharmacyName,
    }
    for(var i in selectedList){
      var prescriptionDetailInfo = {
        medicinalId: selectedList[i].id,
        medicinalCode: selectedList[i].medicinalCode,
        medicinalName: selectedList[i].medicinalName,
        medicinalSalesPrice: selectedList[i].medicinalSalesPrice,
        medicinalQuatity: selectedList[i].num,
        dosageDetail: selectedList[i].usage
      }
      prescriptionDetailInfoList.push(prescriptionDetailInfo)
    }
    prescriptionInfo.prescriptionDetailInfoList = prescriptionDetailInfoList
    wx.showLoading({
      title: '正在提交处方...',
      mask: true
    })
    app.otherAPI.savePrescriptionAndDetailInfo(prescriptionInfo).then(()=>{
      wx.hideLoading()
      wx.showToast({
        title: '处方开具成功',
        mask: true,
        success: function(){
          that.overDiagnosis()
        }
      })
    })
  },

  /**
   * 结束会诊
   */
  overDiagnosis: function(){
    var id = this.data.medicinalRecordInfo.id
    var version = this.data.medicinalRecordInfo.modifyTimestamp
    var that = this
    app.doctor.changeDiagnoseFlag(id,'3',version).then(res => {
      if(res.success){
        setTimeout(()=>{
          // 返回上一页
          wx.navigateBack({
            delta: 2
          })
        },1500)
      }else{
        that.setData({error: res.message})
      }
    })
  },

  /**
   * 确定按钮
   */
  ok: function() {
    if(this.data.selectedList.length == 0){
      this.setData({
        error: '您还没有添加药品'
      })
      return;
    }
    this.openMsgConfirm(2,'是否确定提交处方单');
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getStorage({
      key: 'orderList',
    }).then(res=>{
      console.log('已选处方',res.data)
      that.setData({
        selectedList: res.data
      })
      wx.setStorage({
        data: null,
        key: 'orderList',
      })
    })
    
    var id = options.id
    var that = this
    app.doctor.getMedicinalRecordInfo(id).then(res => {
      that.setData({
        medicinalRecordInfo: res.data,
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