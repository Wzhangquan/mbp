import prefixAppender from '../utils/request';
const request = prefixAppender('prescription/')

export default {
  // 获取我的处方
  getPrescriptionList: function (doctorId,page,limit) {
    return request({
      url: 'getPrescriptionInfoListByDocId?doctorId=' + doctorId+"&page="+page+"&limit="+limit,
      method:'GET'
    });
  },
};
