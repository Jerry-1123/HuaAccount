import { defineStore } from 'pinia';
import _ from 'lodash';

export const useAppStore = defineStore('app', {
    state: () => ({
        tags: [],
        shareInfo: {}
    }),
    getters: {
        tagsList(state) {

            return _.concat(
                [
                    {
                        _id: 'all',
                        tagName: '全部类型',
                        tagType: 'all'
                    },
                    {
                        _id: 'allExpenses',
                        tagName: '全部支出',
                        tagType: 'all'
                    },
                    {
                        _id: 'allIncome',
                        tagName: '全部收入',
                        tagType: 'all'
                    }
                ],
                state.tags
            );

        },
        tagsGroup(state) {

            let allTags = _.concat(
                [
                    {
                        _id: 'all',
                        tagName: '全部类型',
                        tagType: 'all'
                    },
                    {
                        _id: 'allExpenses',
                        tagName: '全部支出',
                        tagType: 'all'
                    },
                    {
                        _id: 'allIncome',
                        tagName: '全部收入',
                        tagType: 'all'
                    }
                ],
                state.tags
            );

            return _.groupBy(allTags, item => item.tagType);

        },
        expenseTags(state) {

            return _.filter(state.tags, item => item.tagType === 'expenses');

        },
        incomeTags(state) {

            return _.filter(state.tags, item => item.tagType === 'income');

        },
        shareData(state) {

            if (_.isEmpty(state.shareInfo)) {

                return {
                    title: '',
                    path: '',
                    imageUrl: ''
                };

            } else {

                return {
                    title: state.shareInfo.title,
                    path: state.shareInfo.path,
                    imageUrl: state.shareInfo.imageUrl
                };

            }

        }
    },
    actions: {}
});