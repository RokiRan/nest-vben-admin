<template>
    <div class="p-3 bg-white dark:bg-dark-500 rounded-lg">
        <div class="mb-3">
            <div class="flex items-center justify-center gap-2">
                <span class="text-14 font-medium text-gray-800 dark:text-gray-200">{{ match.home_team }}</span>
                <span class="text-14 text-gray-500 dark:text-gray-400">VS</span>
                <span class="text-14 font-medium text-gray-800 dark:text-gray-200">{{ match.away_team }}</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div class="flex flex-col gap-1">
                <div class="text-15 text-gray-500 dark:text-gray-400">{{ match.league?.league_name }}</div>
                <div class="text-14 text-gray-500 dark:text-gray-400">
                    <span>{{ match.match_num_str }}</span>
                </div>
                <div class="text-15 text-gray-500 dark:text-gray-400">
                    <span>{{ formatTime(`${match.match_date} ${match.match_time}`) }}</span>
                </div>
            </div>
            <div>
                <div class="grid grid-cols-3 gap-1">
                    <van-button v-for="option in options" 
                        :key="option.code" 
                        size="small"
                        :type="isSelected(option) ? 'primary' : 'default'" 
                        @click="handleSelect(option)"
                        :disabled="!option.odds"
                        class="h-12 min-w-[60px] flex flex-col items-center justify-center p-1"
                        >
                        <span class="text-12">{{ option.odds ? option.name : '' }}</span>
                        <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ option.odds || '-' }}</span>
                    </van-button>
                </div>
                <div class="text-13 text-gray-500 dark:text-gray-400 text-center mt-2">展开全部</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface Option {
    code: string;
    name: string;
    odds: string | number;
}

const props = defineProps({
    match: {
        type: Object,
        required: true
    },
    selectedOptions: {
        type: Array as PropType<Option[]>,
        default: () => []
    }
})

const emit = defineEmits(['select'])

// 格式化时间
const formatTime = (time) => {
    return dayjs(time).format('MM-DD HH:mm')
}

// 投注选项
const options = computed(() => [
    { code: '胜', name: '胜', odds: props.match.home_odds },
    { code: '平', name: '平', odds: props.match.draw_odds },
    { code: '负', name: '负', odds: props.match.away_odds },
    // 让球
    { code: '让胜', name: '让胜', odds: props.match.handicap_home_odds },
    { code: '让平', name: '让平', odds: props.match.handicap_draw_odds },
    { code: '让负', name: '让负', odds: props.match.handicap_away_odds },
])

// 是否已选择
const isSelected = (option: Option) => {
    return props.selectedOptions.some(selected => selected.code === option.code)
}

// 处理选择
const handleSelect = (option: Option) => {
    emit('select', props.match, option)
}
</script>