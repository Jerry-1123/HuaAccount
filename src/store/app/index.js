import { defineStore } from 'pinia';
import { BillTypeEnum } from '@/enums';
import _ from 'lodash';

export const useAppStore = defineStore('app', {
    state: () => ({
        tags: [],
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

            return _.filter(state.tags, item => item.tagType === BillTypeEnum.EXPENSES);

        },
        incomeTags(state) {

            return _.filter(state.tags, item => item.tagType === BillTypeEnum.INCOME);

        }
    },
    actions: {
        setTags({ tags }) {

            this.tags = tags;

        }
    }
});