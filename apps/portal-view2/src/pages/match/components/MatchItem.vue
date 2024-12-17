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
                <div class="flex gap-2">
                    <!-- 让球数列 -->
                    <div class="flex gap-1 flex-col items-center justify-center">
                        <div class="relative flex  flex-1 flex-col items-center justify-center h-12 min-w-[30px] bg-gray-50 dark:bg-dark-600 rounded">
                            <span v-if="match.is_single_no_handicap" 
                                  class="absolute -top-1 right-1 text-10 text-red bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                                单
                            </span>
                            <span class="text-13 text-gray-600 dark:text-gray-300">0</span>
                        </div>
                        <div class="relative flex flex-1  flex-col items-center justify-center h-12 min-w-[30px] bg-gray-50 dark:bg-dark-600 rounded">
                            <span v-if="match.is_single_handicap" 
                                  class="absolute -top-1 right-1 text-10 text-red bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                                单
                            </span>
                            <span class="text-13 text-gray-600 dark:text-gray-300">{{ match.goal_line }}</span>
                        </div>
                    </div>

                    <!-- 胜平负按钮 -->
                    <div class="grid grid-rows-2 grid-cols-3 gap-1">
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
                </div>
                <div class="text-13 text-gray-500 dark:text-gray-400 text-center mt-2" @click="handleShowAllOptions">
                    展开全部
                </div>
            </div>
        </div>

        <!-- 所有玩法弹出层 -->
        <van-popup
            v-model:show="showAllOptions"
            position="bottom"
            round
            :style="{ height: '70%' }"
            closeable
        >
            <div class="p-4">
                <div class="text-16 font-medium mb-4">{{ match.home_team }} VS {{ match.away_team }}</div>
                
                <!-- 胜平负 -->
                <div class="option-section mb-4">
                    <div class="text-14 font-medium mb-2">胜平负</div>
                    <div class="grid grid-cols-3 gap-2">
                        <van-button
                            v-for="option in options.slice(0, 3)"
                            :key="option.code"
                            size="small"
                            :type="isSelected(option) ? 'primary' : 'default'"
                            @click="handleSelect(option)"
                            :disabled="!option.odds"
                            class="h-12"
                        >
                            <span class="text-12">{{ option.name }}</span>
                            <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ option.odds || '-' }}</span>
                        </van-button>
                    </div>
                </div>

                <!-- 让球胜平负 -->
                <div class="option-section mb-4">
                    <div class="text-14 font-medium mb-2">让球胜平负 {{ match.goal_line }}</div>
                    <div class="grid grid-cols-3 gap-2">
                        <van-button
                            v-for="option in handicapOptions"
                            :key="option.code"
                            size="small"
                            :type="isSelected(option) ? 'primary' : 'default'"
                            @click="handleSelect(option)"
                            :disabled="!option.odds"
                            class="h-12"
                        >
                            <span class="text-12">{{ option.name }}</span>
                            <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ option.odds || '-' }}</span>
                        </van-button>
                    </div>
                </div>

                <!-- 比分 -->
                <div class="option-section mb-4">
                    <div class="text-14 font-medium mb-2">比分</div>
                    
                    <!-- 胜部分 -->
                    <template v-if="Object.keys(winScores).length > 0">
                        <div class="score-group mb-3">
                            <div class="text-12 text-gray-500 dark:text-gray-400 mb-1">胜</div>
                            <div class="grid grid-cols-4 gap-2">
                                <van-button
                                    v-for="(odds, score) in winScores"
                                    :key="score"
                                    size="small"
                                    :type="isSelected({ code: `${score}`, name: score }) ? 'primary' : 'default'"
                                    @click="handleSelect({ code: `${score}`, name: score, odds })"
                                    :disabled="!odds"
                                    class="h-12"
                                >
                                    <span class="text-12">{{ score }}</span>
                                    <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ odds || '-' }}</span>
                                </van-button>
                            </div>
                        </div>
                    </template>

                    <!-- 平部分 -->
                    <template v-if="Object.keys(drawScores).length > 0">
                        <div class="score-group mb-3">
                            <div class="text-12 text-gray-500 dark:text-gray-400 mb-1">平</div>
                            <div class="grid grid-cols-4 gap-2">
                                <van-button
                                    v-for="(odds, score) in drawScores"
                                    :key="score"
                                    size="small"
                                    :type="isSelected({ code: `${score}`, name: score }) ? 'primary' : 'default'"
                                    @click="handleSelect({ code: `${score}`, name: score, odds })"
                                    :disabled="!odds"
                                    class="h-12"
                                >
                                    <span class="text-12">{{ score }}</span>
                                    <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ odds || '-' }}</span>
                                </van-button>
                            </div>
                        </div>
                    </template>

                    <!-- 负部分 -->
                    <template v-if="Object.keys(loseScores).length > 0">
                        <div class="score-group mb-3">
                            <div class="text-12 text-gray-500 dark:text-gray-400 mb-1">负</div>
                            <div class="grid grid-cols-4 gap-2">
                                <van-button
                                    v-for="(odds, score) in loseScores"
                                    :key="score"
                                    size="small"
                                    :type="isSelected({ code: `${score}`, name: score }) ? 'primary' : 'default'"
                                    @click="handleSelect({ code: `${score}`, name: score, odds })"
                                    :disabled="!odds"
                                    class="h-12"
                                >
                                    <span class="text-12">{{ score }}</span>
                                    <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ odds || '-' }}</span>
                                </van-button>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- 半全场 -->
                <div class="option-section mb-4">
                    <div class="text-14 font-medium mb-2">半全场</div>
                    <div class="grid grid-cols-3 gap-2">
                        <van-button
                            v-for="(odds, result) in parsedHalfFullOdds"
                            :key="result"
                            size="small"
                            :type="isSelected({ code: `${result}`, name: result }) ? 'primary' : 'default'"
                            @click="handleSelect({ code: `${result}`, name: result, odds })"
                            :disabled="!odds"
                            class="h-12"
                        >
                            <span class="text-12">{{ result }}</span>
                            <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ odds || '-' }}</span>
                        </van-button>
                    </div>
                </div>

                <!-- 总进球 -->
                <div class="option-section">
                    <div class="text-14 font-medium mb-2">总进球</div>
                    <div class="grid grid-cols-4 gap-2">
                        <van-button
                            v-for="(odds, goals) in parsedTotalGoalOdds"
                            :key="goals"
                            size="small"
                            :type="isSelected({ code: `${goals}`, name: goals }) ? 'primary' : 'default'"
                            @click="handleSelect({ code: `${goals}`, name: goals, odds })"
                            :disabled="!odds"
                            class="h-12"
                        >
                            <span class="text-12">{{ goals }}球</span>
                            <span class="text-13 text-red-500 dark:text-red-400 mt-0.5">{{ odds || '-' }}</span>
                        </van-button>
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

const showAllOptions = ref(false)

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

// 解析JSON字符串
const safeParseJSON = (jsonString: string) => {
    try {
        return JSON.parse(jsonString || '{}')
    } catch (e) {
        console.error('JSON解析错误:', e)
        return {}
    }
}

// 格式化比分显示
const formatScore = (key: string) => {
  if (key === 'fixedodds') return null
  
  // 处理其他比分
  if (key === '-1-a') return '负其他'
  if (key === '-1-h') return '胜其他'
  if (key === '-1-d') return '平其他'
  
  // 处理标准比分格式 (0102 -> 1:2)
  const home = key.slice(0, 2)
  const away = key.slice(2, 4)
  return `${parseInt(home)}:${parseInt(away)}`
}

// 格式化半全场显示
const formatHalfFull = (key: string) => {
  if (key.length !== 2) return key
  
  const halfMap = { h: '胜', d: '平', a: '负' }
  const fullMap = { h: '胜', d: '平', a: '负' }
  
  const half = halfMap[key[0]]
  const full = fullMap[key[1]]
  
  return `${half}${full}`
}

// 格式化总进球显示
const formatTotalGoals = (key: string) => {
  if (!key.startsWith('s')) return key
  const goals = key.slice(1)
  return goals === '7' ? '7+' : goals
}

// 过滤和转换赔率数据
const processOddsData = (oddsObj: Record<string, any>) => {
  if (!oddsObj) return {}
  
  return Object.entries(oddsObj).reduce((acc, [key, value]) => {
    // 跳过 fixedodds 字段
    if (key === 'fixedodds') return acc
    // 处理赔率值
    acc[key] = typeof value === 'object' ? value.odds : value
    return acc
  }, {} as Record<string, number>)
}

// 延迟加载的赔率数据
const parsedOdds = ref({
  scores: null,
  halfFull: null,
  totalGoal: null
})

// 只在弹窗打开时解析数据
const handleShowAllOptions = () => {
  // 只在第一次打开时解析数据
  if (!parsedOdds.value.scores) {
    const scoreData = safeParseJSON(props.match.score_odds)
    const processedScoreData = processOddsData(scoreData)
    
    // 分组比分数据
    const scores = {
      winScores: {} as Record<string, number>,
      drawScores: {} as Record<string, number>,
      loseScores: {} as Record<string, number>,
    }

    Object.entries(processedScoreData).forEach(([key, odds]) => {
      if (!odds || key === 'fixedodds') return
    
      if (['-1-a', '-1-h', '-1-d'].includes(key)) {
        return
      }
      // 处理标准比分
      if (key.length === 4) {
        const home = parseInt(key.slice(0, 2))
        const away = parseInt(key.slice(2, 4))
        const formattedScore = `${home}:${away}`

        if (home > away) {
          scores.winScores[formattedScore] = odds
        } else if (home === away) {
          scores.drawScores[formattedScore] = odds
        } else {
          scores.loseScores[formattedScore] = odds
        }
      }
    })

    // 处理其他比分，放在各自分组的末尾
    if (processedScoreData['-1-h']) {
      scores.winScores['胜其他'] = processedScoreData['-1-h']
    }
    if (processedScoreData['-1-d']) {
      scores.drawScores['平其他'] = processedScoreData['-1-d']
    }
    if (processedScoreData['-1-a']) {
      scores.loseScores['负其他'] = processedScoreData['-1-a']
    }

    parsedOdds.value.scores = scores
  }

  if (!parsedOdds.value.halfFull) {
    const halfFullData = safeParseJSON(props.match.half_full_odds)
    const processedHalfFullData = processOddsData(halfFullData)
    parsedOdds.value.halfFull = Object.entries(processedHalfFullData).reduce((acc, [key, odds]) => {
      acc[formatHalfFull(key)] = odds
      return acc
    }, {})
  }

  if (!parsedOdds.value.totalGoal) {
    const totalGoalData = safeParseJSON(props.match.total_goal_odds)
    const processedTotalGoalData = processOddsData(totalGoalData)
    parsedOdds.value.totalGoal = Object.entries(processedTotalGoalData).reduce((acc, [key, odds]) => {
      acc[formatTotalGoals(key)] = odds
      return acc
    }, {})
  }

  showAllOptions.value = true
}

// 计算属性改为使用已解析的数据
const winScores = computed(() => parsedOdds.value.scores?.winScores || {})
const drawScores = computed(() => parsedOdds.value.scores?.drawScores || {})
const loseScores = computed(() => parsedOdds.value.scores?.loseScores || {})
const parsedHalfFullOdds = computed(() => parsedOdds.value.halfFull || {})
const parsedTotalGoalOdds = computed(() => parsedOdds.value.totalGoal || {})

// 让球胜负选项
const handicapOptions = computed(() => [
    { code: '让胜', name: '让胜', odds: props.match.handicap_home_odds },
    { code: '让平', name: '让平', odds: props.match.handicap_draw_odds },
    { code: '让负', name: '让负', odds: props.match.handicap_away_odds },
])

onMounted(() => {
//   console.log('Match Data:', props.match)
//   console.log('Score Odds:', props.match.score_odds)
})
</script>

<style lang="scss" scoped>
.option-section {
    @apply bg-gray-50 dark:bg-dark-600 rounded-lg p-3;
}

:deep(.van-popup) {
    @apply bg-white dark:bg-dark-700;
    
    .van-popup__close-icon {
        @apply text-gray-600 dark:text-gray-300;
    }
}

.score-group {
  @apply bg-gray-50/50 dark:bg-dark-600/50 rounded p-2;
}
</style>