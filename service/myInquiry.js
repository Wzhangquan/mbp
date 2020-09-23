import prefixAppender from '../utils/request';
const request = prefixAppender('interrogation/')

export default {
  // 获取我的处方
  getDocPatientList: function (doctorId,page,limit) {
    return request({
      url: 'getDocPatientList?doctorId=' + doctorId+"&page="+page+"&limit="+limit,
      method:'GET'
    });
  },
};
