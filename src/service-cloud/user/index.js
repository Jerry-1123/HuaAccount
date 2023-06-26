import { callCloudFunction } from '@/utils';

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
