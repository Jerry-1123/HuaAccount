const getUrl = (url, params) => {

    if (!params) {

        return url;

    }

    return `${url}?params=${encodeURIComponent(JSON.stringify(params))}`;

};

export const navigateTo = ({ url, params }) => {

    uni.navigateTo({
        url: getUrl(url, params)
    });

};

export const redirectTo = ({ url, params }) => {

    uni.redirectTo({
        url: getUrl(url, params)
    });

};

export const reLaunch = ({ url, params }) => {

    uni.reLaunch({
        url: getUrl(url, params)
    });

};

export const switchTab = ({ url }) => {

    uni.switchTab({
        url
    });

};

export const navigateBack = ({ delta }) => {

    uni.navigateBack({
        delta
    });

};
