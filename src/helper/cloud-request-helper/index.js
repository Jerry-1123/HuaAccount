// 云函数调用
export const cloudRequest = ({
    name,
    data
}) => {

    return uniCloud.callFunction({
        name,
        data
    }).then(({ result: { status, msg, data = null } }) => {

        if (status === 200) {

            return Promise.resolve(data);

        } else {

            uni.showToast({ title: msg, icon: 'none' });

        }

    }).catch(err => {

        console.error('云函数调用失败', err);

        uni.showToast({ title: `云函数调用失败`, icon: 'none' });

    });

};