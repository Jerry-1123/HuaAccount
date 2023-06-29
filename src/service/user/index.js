import _ from 'lodash';
import moment from 'moment';

export const getUserByOpenId = ({
    openId
}) => {

    const db = uniCloud.database();

    return db.collection('user')
        .where(`openId == "${openId}"`)
        .get()
        .then(({ result }) => {

            return {
                userInfo: result.data && result.data.length === 1 ? result.data[0] : null
            };

        });

};

export const createUser = ({
    openId
}) => {

    const db = uniCloud.database();

    const nickName = `微信用户${_.random(10000000, 99999999)}`;

    return db.collection('user')
        .add({
            openId,
            nickName,
            createTime: moment().valueOf(),
            updateTime: moment().valueOf()
        })
        .then(({ result: { id: userId } }) => {

            return {
                userId,
                nickName
            };

        });

};

export const updateUser = ({
    openId,
    nickName,
    avatarUrl
}) => {

    const db = uniCloud.database();

    return db.collection('user')
        .where(`openId == "${openId}"`)
        .update({
            nickName,
            avatarUrl,
            updateTime: moment().valueOf()
        });

};
