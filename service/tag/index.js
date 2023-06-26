// 获取所有标签
export const getTags = () => {

    const db = uniCloud.database();

    return db.collection('tag')
        .orderBy('index asc')
        .get()
        .then(({ result }) => {

            return {
                tags: result.data
            };

        });

};
