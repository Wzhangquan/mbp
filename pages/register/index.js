// pages/yuyue/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    color: '',
    name: '',
    mobile: '',
    date: '',
    intention: '',
    demand: '',
    buttons: [{text: '取消'}, {text: '确定'}],
    // 性别选择器参数
    sex: null,
    sexList: ['男','女'],
    region: [' ', ' ', ' '],
    regionCode: ['', '', ''],
    // 科室选择器参数
    departmentIndex: null,
    departmentCodeList: null,
    departmentList: null,
    department: {hospitalDepCode: null, hospitalDepCode: null},
    // 主治疾病选择器参数
    diseasesList: null,
    selectedDiseasesList: [],
    selectedDiseasesText: null,
    // 级别选择器参数
    doctorLevelIndex: null,
    doctorLevelCodeList: null,
    doctorLevelList: null,
    doctorLevel: {doctorLevelCode: null, doctorLevelName: null},
    // 是否阅读知情书
    isAgree: false,
    // 错误信息
    error: ''
  },

  onShow: function (e) {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initDepartmentInfo();
    this.initDoctorLevel();
  },

  /**
   * 初始化科室选择器参数
   */
  initDepartmentInfo: function () {
    var that = this
    app.otherAPI.getDepartmentInfo().then(res => {
      var departmentList = []
      var departmentCodeList = []
      for(var index in res){
        departmentList.push(res[index].hospitalDepName)
        departmentCodeList.push(res[index].hospitalDepCode)
      }
      that.setData({
        departmentList: departmentList,
        departmentCodeList: departmentCodeList
      })
    })
  },

  /**
   * 打开主治疾病弹窗
   */
  openConfirm: function () {
    if(this.data.department.hospitalDepCode == null){
      this.setData({
        error: '请选择科室'
      })
      return;
    }
    this.setData({
      dialogShow: true
    })
  },

  /**
   * 弹窗按钮事件
   * @param {*} e 
   */
  tapDialogButton(e) {
    // 确定
    if(e.detail.index == 1){
      var diseasesList = this.data.diseasesList
      var department = this.data.department
      var selectedDiseasesList = []
      for(var i in diseasesList){
        if(diseasesList[i].selected){
          var diseases = {
            hospitalDepCode: department.hospitalDepCode,
            hospitalDepName: department.hospitalDepName,
            diseasesCode: diseasesList[i].value,
            diseasesName: diseasesList[i].title
          }
          selectedDiseasesList.push(diseases)
        }
      }
      if(selectedDiseasesList.length == 0){
        this.setData({
          error: '请选择主治疾病'
        })
        return
      }
      var selectedDiseasesText = ''
      for(var i in selectedDiseasesList){
        if(i != 0){
          selectedDiseasesText = selectedDiseasesText + ','
        }
        selectedDiseasesText = selectedDiseasesText + selectedDiseasesList[i].diseasesName
      }
      this.setData({
          dialogShow: false,
          selectedDiseasesList,
          selectedDiseasesText
      })
    }else{
      var selectedDiseasesList = this.data.selectedDiseasesList
      if(selectedDiseasesList == null || selectedDiseasesList.length == 0){
        var diseasesList = this.data.diseasesList
        for(var i in diseasesList){
          diseasesList[i].selected = false
        }
        this.setData({
          diseasesList
        })
      }else{
        var diseasesList = this.data.diseasesList
        for(var i in diseasesList){
          diseasesList[i].selected = false
          for(var j in selectedDiseasesList){
            if(selectedDiseasesList[j].diseasesCode == diseasesList[i].value){
              diseasesList[i].selected = true
              break
            }
          }
        }
        this.setData({
          diseasesList
        })
      }
      this.setData({
        dialogShow: false,
      })
    }
  },

  /**
   * 初始化主治疾病选择器参数
   */
  initDiseases: function () {
    var that = this
    app.doctor.getDiseasesList(that.data.department.hospitalDepCode).then(res => {
      var diseasesList = []
      for(var index in res.data){
        var diseases = {
          value: res.data[index].diseasesCode,
          selected: false,
          title: res.data[index].diseasesName
        }
        diseasesList.push(diseases)
      }
      that.setData({
        diseasesList
      })
    })
  },

  /**
   * 初始化级别选择器参数
   */
  initDoctorLevel: function () {
    var that = this
    app.doctor.getDoctorLevel().then(res => {
      var doctorLevelList = []
      var doctorLevelCodeList = []
      for(var index in res.data){
        doctorLevelList.push(res.data[index].codeName)
        doctorLevelCodeList.push(res.data[index].code)
      }
      that.setData({
        doctorLevelList: doctorLevelList,
        doctorLevelCodeList: doctorLevelCodeList
      })
    })
  },

  /**
   * 性别选择器
   * @param {*} e 
   */
  bindSexChange: function (e) {
    this.setData({
      sex: e.detail.value
    })
  },

  /**
   * 城市选择器
   * @param {*} e 
   */
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      regionCode: e.detail.code
    })
  },

  /**
   * 科室选择器
   * @param {*} e 
   */
  bindDepartmentChange: function (e) {
    var that = this
    var index = e.detail.value
    var department = {
      hospitalDepCode: that.data.departmentCodeList[index],
      hospitalDepName: that.data.departmentList[index]
    }
    that.setData({
      department,
      departmentIndex: index
    })
    that.initDiseases()
  },

  /**
   * 选择主治疾病
   * @param {*} e 
   */
  checkboxChange(e){
    // console.log('checkboxChange e:',e);
    let string = "diseasesList["+e.target.dataset.index+"].selected"
    this.setData({
      [string]: !this.data.diseasesList[e.target.dataset.index].selected
    })
    let detailValue = this.data.diseasesList.filter(it => it.selected).map(it => it.value)
    // console.log('选中的疾病为：', detailValue)
  },

  /**
   * 级别选择器
   * @param {*} e 
   */
  bindDoctorLevelChange: function (e) {
    var that = this
    var index = e.detail.value
    var doctorLevel = {
      doctorLevelCode: that.data.doctorLevelCodeList[index],
      doctorLevelName: that.data.doctorLevelList[index]
    }
    that.setData({
      doctorLevel,
      doctorLevelIndex: index
    })
  },

  /**
   * 手机号验证
   * @param {*} e 
   */
  blurMobile: function (e) {
    if (!(/^1[34578]\d{9}$/.test(e.detail.value))){
      this.setData({
        error: '请输入正确的手机号码'
      })
    }
  },

  /**
   * 身份证验证
   * @param {*} code 
   */
  verificationIdentificationCard: function (code) {
    var that = this;
    //身份证号合法性验证 
    //支持15位和18位身份证号
    //支持地址编码、出生日期、校验位验证
    var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
    var tip = "";
    var pass = true;
    var reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
    if (!code || !code.match(reg)) {
      tip = "身份证号格式错误";
      pass = false;
    }else if (!city[code.substr(0, 2)]) {
      tip = "身份证号地址编码错误";
      pass = false;
    }else {
      //18位身份证需要验证最后一位校验位
      if (code.length == 18) {
        code = code.split('');
        //∑(ai×Wi)(mod 11)
        //加权因子
        var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        //校验位
        var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
        var sum = 0;
        var ai = 0;
        var wi = 0;
        for (var i = 0; i < 17; i++) {
          ai = code[i];
          wi = factor[i];
          sum += ai * wi;
        }
        var last = parity[sum % 11];
        if (parity[sum % 11] != code[17]) {
          tip = "身份证号校验位错误";
          pass = false;
        }
      }
    }
    if (!pass) {
      that.setData({
        error: tip
      })
    }
    return pass
  },

  /**
   * 身份证输入框失焦事件
   * @param {*} e 
   */
  blurIdentificationCard: function (e) {
    this.verificationIdentificationCard(e.detail.value)
  },

  /**
   * 验证
   * @param {*} data 
   */
  verification: function (data) {
    if(!this.data.isAgree){
      this.setData({
        error: '请阅读《知情同意书》',
      })
      return false;
    }
    if(data.doctorName == '' || data.doctorName == null || data.doctorName == undefined){
      this.setData({
        error: '请输入姓名',
      })
      return false;
    }
    if(data.sex == '' || data.sex == null || data.sex == undefined){
      this.setData({
        error: '请选择性别',
      })
      return false;
    }
    if(data.identificationCard == '' || data.identificationCard == null || data.identificationCard == undefined){
      this.setData({
        error: '请输入身份证号码',
      })
      return false;
    }else{
      if(!this.verificationIdentificationCard(data.identificationCard)){
        return false
      }
    }
    if(data.mobile == '' || data.mobile == null || data.mobile == undefined){
      this.setData({
        error: '请输入手机号码',
      })
      return false;
    }else{
      if (!(/^1[34578]\d{9}$/.test(data.mobile))){
        this.setData({
          error: '请输入正确的手机号码'
        })
        return false;
      }
    }
    // if(data.provinceCode == '' || data.provinceCode == null || data.provinceCode == undefined){
    //   this.setData({
    //     error: '请选择省/市/区',
    //   })
    //   return false;
    // }
    // if(data.pharmacyAddrress == '' || data.pharmacyAddrress == null || data.pharmacyAddrress == undefined){
    //   this.setData({
    //     error: '请输入详细住址',
    //   })
    //   return false;
    // }
    if(data.hospitalName == '' || data.hospitalName == null || data.hospitalName == undefined){
      this.setData({
        error: '请输入供职医院',
      })
      return false;
    }
    if(data.hospitalDepName == '' || data.hospitalDepName == null || data.hospitalDepName == undefined){
      this.setData({
        error: '请选择科室',
      })
      return false;
    }
    if(data.doctorDepartmentDiseasesInfoList == '' || data.doctorDepartmentDiseasesInfoList == null || data.doctorDepartmentDiseasesInfoList == undefined){
      this.setData({
        error: '请选择主治疾病',
      })
      return false;
    }
    if(data.doctorLevelName == '' || data.doctorLevelName == null || data.doctorLevelName == undefined){
      this.setData({
        error: '请选择级别',
      })
      return false;
    }

    return true;
  },

  /**
   * 提交表单
   * @param {*} e 
   */
  register: function (e) {
    var that = this
    // 表单参数
    var params = e.detail.value
    // 用户微信信息
    var user = app.globalData.userInfo

    var doctorData = {
      doctorName: params.doctorName, //医生名字
      sex: that.data.sex == null? null : that.data.sex + 1, //性别
      identificationCard: params.identificationCard, //身份证号码
      identificationCardDocId: 1, // TODO 身份证照片
      mobile: params.mobile, //手机号码
      provinceCode: that.data.regionCode[0], //省编码
      provinceName: that.data.region[0], //省名称
      cityCode: that.data.regionCode[1], //市编码
      cityName: that.data.region[1], //市名称
      areaCode: that.data.regionCode[2], //区县编码
      areaName: that.data.region[2], //区县名称
      pharmacyAddress: params.pharmacyAddress, //所在地址
      hospitalCode: '1', //医院编码
      hospitalName: params.hospitalName, //医院名称
      hospitalDepCode: that.data.department.hospitalDepCode, //科室编码
      hospitalDepName: that.data.department.hospitalDepName, //科室名称
      doctorDepartmentDiseasesInfoList: that.data.selectedDiseasesList, //主治疾病
      doctorLevelCode: that.data.doctorLevel.doctorLevelCode, //级别编码
      doctorLevelName: that.data.doctorLevel.doctorLevelName, //级别名称
      personalSpecialty: params.personalSpecialty, //个人擅长
      personalIntroduction: params.personalIntroduction, //个人介绍
      doctorDocFileId: 1, // TODO 证书
      weixinOpenid: user.openId, //微信openid
      weixinName: user.nickName, //微信昵称
      weixinHeadUrl: user.avatarUrl, //微信头像url
      weixinUnionid: user.unionId //微信unionid
    }

    if(!this.verification(doctorData)){
      return;
    }

    wx.showLoading({
      title: '提交中..',
      mask: true
    });
    app.doctor.register(JSON.stringify(doctorData)).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '注册成功!',
        mask: true,
        success: function(e){
          app.doctor.getDoctorInfo(app.globalData.userInfo.openId).then(result => {
            console.log('医生信息', result.data)
            app.globalData.doctorInfo = result.data
            setTimeout(()=>{
              wx.switchTab({
                url: '../inquiry/inquiry',
              })
            },1500)
          })
        }
      });
    })
  },

  /**
   * 是否同意
   * @param {*} e 
   */
  bindAgreeChange: function (e) {
    this.setData({
        isAgree: !!e.detail.value.length
    });
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