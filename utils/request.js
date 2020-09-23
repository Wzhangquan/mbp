// import { flat } from '@Utils/util';
// 本地
const serverUrl = "http://localhost:8091/yzt/";
// 测试环境
const testServerUrl = "https://testenv.lothz.com/yzt/";

export default function prefixAppender(prefix) {
    return (requestObject) => {
        requestObject.prefix = prefix
        return request(requestObject)
    }
}

function request({
    baseUrl = testServerUrl,
    prefix = '',
    url,
    params,
    data,
    method = 'POST',
    contentType = 'application/json'
}) {
    return new Promise((resolve, reject) => {
        const header = {
            'content-type': contentType,
        };

        const requestUrl =
            baseUrl + prefix + url + (params ? `?${objectToQuerystring(params)}` : '');
        const requestInfo = {
            url: requestUrl,
            data,
            method,
            header,
        };
        wx.request({
            ...requestInfo,
            success({ header, ...res }) {
                const { data, statusCode, errMsg } = res;
                if (statusCode == 200) {
                    resolve(data || {});
                } else {
                    reject(errMsg || '');
                }
            },
            fail(err) {
                reject(err);
                wx.showToast({
                    title: '请求出错',
                    icon: 'none',
                });
            },
        });
    });
}