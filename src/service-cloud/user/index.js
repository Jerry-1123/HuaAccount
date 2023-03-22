import { callCloudFunction } from '@/util';

// 根据code获取openId
export const getOpenIdByCode = ({
    code
}) => {

    return callCloudFunction({
        name: 'user',
        data: {
            action: 'getOpenIdByCode',
            code
        }
    });

};
