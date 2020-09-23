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
    // 药品详情弹窗
    dialogShow: false,
    // 药品详情弹窗按钮
    buttons: [{text: '取消'},{text: '确定'}],
    // 药品列表
    list: [],
    // 选中药品数量
    selectedNum: 1,
    // 选中药品用量
    selectedUsage: '',
    // 选中药品
    selectedPerscription: {},
    // 选好的药品
    selectedList: [],
    // 消息弹窗
    msgDialogShow: false,
    // 消息弹窗按钮
    msgButtons: [{text: '取消'}, {text: '确定'}],
    // 消息弹窗类型 1：列表减号按钮按下后触发的  2：确定按钮按下后触发的
    msgType: 1,
    page: 1,
    records: 0
  },
  /**
   * 搜索栏
   * @param {} value 
   */
  search: function (value) {
    var that = this
    if(this.data.records == 0 || value == '') return new Promise((resolve, reject) => {setTimeout(() => {resolve(null)}, 500)})
    app.otherAPI.getSearchMedicinalInfoList(that.data.medicinalRecordInfo.pharmacyCode,value,1,this.data.records).then(res => {
      console.log('搜索药品',res.rows)
      that.setData({
        list: res.rows
      })
    })

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 搜索结果列表
        var list = this.data.list;
        var resultList = [];
        for(var index in list){
          var item = {
            text: list[index].medicinalName,
            value: {
              medicinal: list[index]
            }
          };
          resultList.push(item);
        }
        resolve(resultList)
      }, 800)
    })
  },

  /**
   * 搜索栏返回框
   * @param {} e 
   */
  selectResult: function (e) {
    this.initSelectPrescription(e.detail.item.value.medicinal);
    this.openConfirm();
    this.selectComponent("#searchbar").hideInput();
    this.selectComponent("#searchbar").clearInput();
  },
  /**
   * 初始化当前选中药品
   */
  initSelectPrescription: function(data) {
    this.setData({
      selectedPerscription: data,
      selectedNum: 1,
      selectedUsage: ''
    })
  },
  /**
   * 搜索栏选中
   */
  searchFocus: function () {
    this.setData({
      inputShowed: true
    })
  },
  /**
   * 光标离开搜索栏
   */
  searchBlur: function () {
    this.selectComponent("#searchbar").hideInput();
    this.setData({
      inputShowed: false
    })
  },
  /**
   * 绑定用法用量输入框赋值
   */
  bingUsageInput: function (e) {
    this.setData({
      selectedUsage: e.detail.value
    })
  },
  /**
   * 打开弹窗
   */
  openConfirm: function (e) {
    var that = this
    if(e != null){
      var index = e.currentTarget.dataset.index
      console.log('选中药品',that.data.medicinalInfoList[index])
      var selectedPerscription = that.data.medicinalInfoList[index]
      that.setData({
        selectedPerscription: selectedPerscription
      })
    }
    this.setData({
        dialogShow: true
    })
  },
  /**
   * 弹窗点击按钮
   * @param {*} e 
   */
  tapDialogButton(e) {
    this.setData({
        dialogShow: false,
        inputShowed: false
    })
    if(e.detail.index == 1){
      var prescription = this.data.selectedPerscription
      if(this.data.selectedUsage != undefined && this.data.selectedUsage != null && this.data.selectedUsage != ''){
        prescription.usage = this.data.selectedUsage;
      }
      prescription.num = this.data.selectedNum;
      this.setData({
        selectedPerscription: prescription
      })
      // 将当前药品返回到已经选择的药品中
      var selectedList = this.data.selectedList;
      // 禁止添加相同药品
      for(var index in selectedList){
        if(selectedList[index].id == prescription.id){
          this.setData({
            error: '药品不能重复添加'
          })
          return;
        }
      }
      selectedList.push(prescription);
      this.setData({
        selectedList: selectedList
      })
    }
    this.setData({
      selectedNum: 1,
      selectedUsage: ''
    })
  },
  /* 点击减号 */
  bindMinus: function() {
    var num = this.data.selectedNum;
    // 如果大于1时，才可以减
    if (num > 1) {
        num --;
    }
    // 将数值写回
    this.setData({
      selectedNum: num
    });
  },  
  /* 点击加号 */
  bindPlus: function() {
    var num = this.data.selectedNum;
    // 不作过多考虑自增1
    num ++;
    // 将数值写回  
    this.setData({  
      selectedNum: num
    });
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
          wx.navigateBack()
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
   * 打开处方表详情
   */
  orderDetail: function() {
    var that = this
    wx.setStorage({
      data: that.data.selectedList,
      key: 'orderList',
    })
    wx.navigateTo({
      url: 'prescriptionOrder?id='+that.data.medicinalRecordInfo.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var that = this
    app.doctor.getMedicinalRecordInfo(id).then(res => {
      that.setData({
        medicinalRecordInfo: res.data,
      })
      app.otherAPI.getMedicinalInfoList(res.data.pharmacyCode,'1').then(res => {
        console.log('所有药品',res.rows)
        that.setData({
          medicinalInfoList: res.rows,
          // 总个数
          records: res.records
        })
      })
    })
    this.setData({
      search: this.search.bind(this)
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
    wx.getStorage({
      key: 'orderList',
    }).then(res=>{
      if(res != null && res.data != null){
        this.setData({
          selectedList: res.data
        })
        wx.setStorage({
          data: null,
          key: 'orderList',
        })
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
    var that = this
    that.setData({page:that.data.page+1})

    app.otherAPI.getMedicinalInfoList(that.data.medicinalRecordInfo.pharmacyCode,that.data.page).then(res => {
      console.log('分页药品',res.rows)
      that.setData({
        medicinalInfoList: that.data.medicinalInfoList.concat(res.rows)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})