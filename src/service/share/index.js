export const getShareInfo = () => {

    const db = uniCloud.database();

    return db.collection('share')
        .get()
        .then(({ result }) => {

            return {
                shareInfo: result.data[0]
            };

        });

};
