import prefixAppender from '../utils/request';
const request = prefixAppender('')

export default {
  // 获取科室信息
  getDepartmentInfo: function () {
    return request({
      url: 'api/home/getDepartmentInfo',
      method:'GET'
    });
  },
  // 获取药品
  getMedicinalInfoList: function (pharmacyCode,page) {
    return request({
      url: 'api/inquiry/medicinal-info-list.json?pharmacyCode='+pharmacyCode+'&page='+page,
      method:'GET'
    });
  },
  // 搜索药品
  getSearchMedicinalInfoList: function (pharmacyCode,medicinalName,page,limit) {
    return request({
      url: 'api/inquiry/medicinal-info-list.json?pharmacyCode='+pharmacyCode+'&medicinalName='+medicinalName+'&page='+page+'&limit='+limit,
      method:'GET'
    });
  },
  // 生成处方单
  savePrescriptionAndDetailInfo: function (prescriptionInfo) {
    return request({
      url: 'prescription/savePrescriptionAndDetailInfo?pharmacyCode',
      data: prescriptionInfo,
      method:'POST'
    });
  }
};
