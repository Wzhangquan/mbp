import prefixAppender from '../utils/request';
const request = prefixAppender('auth/')

export default {
  // 授权登录
  login: function (data) {
    return request({
      url: 'doctorLogin',
      data: data,
      method: 'POST',
      contentType:"application/x-www-form-urlencoded"
    });
  },
  // 获取腾讯IM签名
  getUserSig: function(data){
    return request({
      url: 'userSig',
      data: data,
      method: 'POST',
      contentType:"application/x-www-form-urlencoded"
    });
  }
};
