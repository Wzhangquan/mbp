import prefixAppender from '../utils/request';
const request = prefixAppender('doctor/')

export default {
  // 获取医生信息
  getDoctorInfo: function (openId) {
    return request({
      url: 'info?openId=' + openId,
      method:'GET'
    });
  },
  // 注册医生信息
  register:function(doctorInfo){
    return request({
      url: 'register',
      data: doctorInfo,
      method:'POST'
    });
  },
  // 获取病历表
  getMedicinalRecordList:function(doctorId){
    return request({
      url: 'medical/record?doctorId='+doctorId,
      method:'GET',
    });
  },
  // 获取疾病信息
  getDiseasesList: function (hospitalDepCode) {
    return request({
      url: 'getDiseasesInfoByDepCode?depCode=' + hospitalDepCode,
      method:'GET'
    });
  },
  // 修改就诊状态
  changeDiagnoseFlag: function (id, diagnoseFlag, version) {
    return request({
      url: 'medical/changeDiagnoseFlag?id=' + id + '&diagnoseFlag=' + diagnoseFlag + '&version=' + version,
      method:'GET'
    });
  },
  // 获取详细的就诊信息
  getMedicinalRecordInfo: function (id) {
    return request({
      url: 'medical/getMedicinalRecordInfo?id=' + id,
      method:'GET'
    });
  },
  // 获取级别信息
  getDoctorLevel: function () {
    return request({
      url: 'code/getSysCodeListByType?typeCode=DOCTOR_LEVEL_CODE',
      method:'GET'
    });
  }
};
