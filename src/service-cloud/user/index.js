import { cloudRequest } from '@/helper/cloud-request-helper';

// 根据code获取openId
export const getOpenIdByCode = ({
    code
}) => {

    return cloudRequest({
        name: 'user',
        data: {
            action: 'getOpenIdByCode',
            code
        }
    });

};
