<template>
  <van-popup
    :show="show"
    @update:show="$emit('update:show', $event)"
    @open="onOpen"
    position="bottom"
    :style="{ height: '80%' }"
    round
    closeable>
    <div class="bet-slip">
      <!-- 标题 -->
      <div class="bet-slip-header">
        <van-button plain hairline type="primary" size="small" @click="clearAll">清空</van-button>
      </div>

      <!-- 选中的比赛列表 -->
      <div class="selected-matches">
        <van-swipe-cell v-for="match in displayMatches" :key="match.match_id">
          <van-cell>
            <template #title>
              <div class="match-info">
                <div class="match-teams">{{ match.home_team }} VS {{ match.away_team }}</div>
                <div class="match-time">{{ match.match_num_str }}</div>
              </div>
            </template>
            <template #value>
              <div class="selected-option">
                <div v-for="option in match.options" :key="option.code" class="option-item">
                  <span class="option-name">{{ option.name }}</span>
                  <van-stepper
                    v-model="option.odds"
                    step="0.01"
                    decimal-length="2"
                    min="1"
                    input-width="60px"
                    button-size="18px"
                    @change="(value) => updateLocalOdds(match.match_id, option.code, value)"
                  />
                </div>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button square type="danger" text="删除" @click="removeMatch(match)" />
          </template>
        </van-swipe-cell>
      </div>

      <!-- 过关方式选择 -->
      <div class="pass-type">
        <van-cell title="过关方式" />
        <van-checkbox-group v-model="selectedPassTypes" class="pass-type-options">
          <van-checkbox 
            v-for="type in passTypeOptions" 
            :key="type" 
            :name="type"
            :disabled="!isPassTypeAvailable(type)"
            >
            {{ type }}
          </van-checkbox>
        </van-checkbox-group>
      </div>

      <!-- 投注倍数 -->
      <div class="bet-multiple">
        <van-cell title="投注倍数">
          <template #value>
            <van-stepper v-model="multiple" min="1" max="50" integer />
          </template>
        </van-cell>
      </div>

      <!-- 投注信息和底部按钮区域调整 -->
      <div class="bet-footer">
        <!-- 投注信息 -->
        <div class="bet-info border-t-solid border-t-1 border-t-gray-100 dark:border-t-dark-600">
          <van-cell title="注数" :value="`${betCount}注`" />
          <van-cell title="单注金额" value="2元" />
          <van-cell title="总金额" :value="`${totalAmount}元`" />
          <!-- <van-cell title="预计奖金" :value="`${minBonus}~${maxBonus}元`" /> -->
        </div>

        <!-- 底部按钮 -->
        <div class="bet-actions">
          <van-submit-bar
            :price="totalAmount * 100"
            button-text="确认投注"
            @submit="handleSubmit"
            safe-area-inset-bottom>
            <template #tip>
              预计奖金：{{ minBonus }}~{{ maxBonus }}元
            </template>
          </van-submit-bar>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  selectedMatches: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'submit', 'cancel'])

// 过关方式选择
const selectedPassTypes = ref<string[]>([])
const passTypeOptions = [
  '2串1',
  '3串1',
  '4串1',
  '5串1',
  '6串1',
  '7串1',
  '8串1'
]

// 投注倍数
const multiple = ref(1)

// 监听倍数变化，确保不超过50倍
watch(multiple, (newValue) => {
  if (newValue > 50) {
    multiple.value = 50
    showToast('最高投注倍数为50倍')
  }
})

// 本地维护的赔率数据
const localOdds = ref(new Map())

// 在打开弹窗时初始化本地赔率数据
const initLocalOdds = () => {
  props.selectedMatches.forEach(match => {
    match.options.forEach(option => {
      const key = `${match.match_id}_${option.code}`
      localOdds.value.set(key, option.odds)
    })
  })
}

// 计算属性
const betCount = computed(() => {
  if (!selectedPassTypes.value.length || !props.selectedMatches.length) return 0

  let totalCount = 0
  selectedPassTypes.value.forEach(type => {
    const passCount = parseInt(type)
    if (passCount > props.selectedMatches.length) return

    // 计算组合数
    const matchesCount = props.selectedMatches.length
    let optionsCount = 1

    // 计算每场比赛选择的选项数
    props.selectedMatches.forEach(match => {
      optionsCount *= match.options.length
    })

    // 计算组合数 C(n,m)
    const combination = (n: number, m: number): number => {
      if (m > n) return 0
      if (m === 0 || m === n) return 1
      return combination(n - 1, m - 1) + combination(n - 1, m)
    }

    totalCount += combination(matchesCount, passCount) * optionsCount
  })

  return totalCount
})

const totalAmount = computed(() => {
  return betCount.value * 2 * multiple.value
})

const minBonus = computed(() => {
  if (!selectedPassTypes.value.length || !props.selectedMatches.length) return '0'

  let minOdds = Infinity
  selectedPassTypes.value.forEach(type => {
    const passCount = parseInt(type)
    if (passCount > props.selectedMatches.length) return

    // 使用 displayMatches 中的赔率数据
    const matchOdds = displayMatches.value.map(match => 
      Math.min(...match.options.map(opt => parseFloat(opt.odds)))
    ).sort((a, b) => a - b)

    // 取前 passCount 个最小赔率相乘
    const minPassOdds = matchOdds.slice(0, passCount).reduce((acc, odds) => acc * odds, 1)
    minOdds = Math.min(minOdds, minPassOdds)
  })

  return (minOdds === Infinity ? 0 : minOdds * 2 * multiple.value).toFixed(2)
})

const maxBonus = computed(() => {
  if (!selectedPassTypes.value.length || !displayMatches.value.length) return '0';

  // 1. 从 displayMatches 中提取每场比赛的最高赔率
  const maxOddsByMatch = displayMatches.value.reduce((acc, match) => {
    // 获取该场比赛中的最高赔率
    const maxOdds = Math.max(...match.options.map(opt => parseFloat(opt.odds)));
    acc[match.match_id] = maxOdds;
    return acc;
  }, {} as Record<number, number>);

  // 获取所有比赛的最高赔率数组
  const maxOddsArray = Object.values(maxOddsByMatch);
  const matchCount = maxOddsArray.length;

  // 2. 计算每种串关方式的最高奖金
  return selectedPassTypes.value.reduce((totalBonus, passType) => {
    // 获取串关数字，例如 "2串1" 中的 2
    const n = parseInt(passType);
    
    // 如果串关数大于比赛数，跳过
    if (n > matchCount) return totalBonus;

    // 计算组合数
    const combinations = getCombinations(maxOddsArray, n);
    
    // 计算每种组合的奖金并求和
    const passTypeBonus = combinations.reduce((sum, odds) => {
      // 计算单个组合的奖金
      const combinationBonus = odds.reduce((product, odd) => product * odd, 1) 
        * 2 // 单注金额
        * multiple.value;
      return sum + combinationBonus;
    }, 0);

    return totalBonus + passTypeBonus;
  }, 0).toFixed(2);
});

// 辅助函数：计算数组的所有组合
function getCombinations(arr: number[], n: number): number[][] {
  if (n === 1) return arr.map(item => [item]);
  
  const result: number[][] = [];
  
  for (let i = 0; i <= arr.length - n; i++) {
    const subCombinations = getCombinations(arr.slice(i + 1), n - 1);
    subCombinations.forEach(subComb => {
      result.push([arr[i], ...subComb]);
    });
  }
  
  return result;
}

// 方法
const clearAll = () => {
  // 清空选中的比赛
  props.selectedMatches.length = 0
  // 重置过关方式
  selectedPassTypes.value = []
  // 重置倍数
  multiple.value = 1
  // 关闭弹窗
  emit('update:show', false)
}

const removeMatch = (match) => {
  const index = props.selectedMatches.findIndex(m => m.match_id === match.match_id)
  if (index > -1) {
    props.selectedMatches.splice(index, 1)
    // 如果没有比赛了，关闭弹窗
    if (props.selectedMatches.length === 0) {
      emit('update:show', false)
      return
    }
    // 重新计算可用的过关方式
    const maxPass = Math.min(props.selectedMatches.length, 8)
    selectedPassTypes.value = selectedPassTypes.value.filter(type => {
      const passCount = parseInt(type)
      return passCount <= maxPass
    })
    if (selectedPassTypes.value.length === 0) {
      selectedPassTypes.value = [`${maxPass}串1`]
    }
  }
}

const isPassTypeAvailable = (type: string) => {
  const matchCount = props.selectedMatches.length
  const passCount = parseInt(type)
  return matchCount >= passCount
}

const handleSubmit = () => {
  if (betCount.value === 0) {
    showToast('请至少选择一个过关方式')
    return
  }

  const betData = {
    matches: displayMatches.value, // 使用带本地赔率的数据
    passTypes: selectedPassTypes.value,
    playType: 'HHGG',
    multiple: multiple.value,
    strip: betCount.value,
    totalAmount: totalAmount.value,
    minBonus: minBonus.value,
    maxBonus: maxBonus.value
  }

  emit('submit', betData)
}

const onOpen = () => {
  initLocalOdds()
  const count = props.selectedMatches.length
  if (count > 8) {
    selectedPassTypes.value = ['8串1']
  } else {
    selectedPassTypes.value = [`${count}串1`]
  }
}

// 获取本地赔率
const getLocalOdds = (matchId: number, optionCode: string) => {
  const key = `${matchId}_${optionCode}`
  return localOdds.value.get(key)
}

// 更新本地赔率
const updateLocalOdds = (matchId: number, optionCode: string, newOdds: number) => {
  const key = `${matchId}_${optionCode}`
  localOdds.value.set(key, newOdds)
}

// 使用计算属性获取展示用的比赛数据
const displayMatches = computed(() => {
  return props.selectedMatches.map(match => ({
    ...match,
    options: match.options.map(option => ({
      ...option,
      odds: getLocalOdds(match.match_id, option.code) || option.odds
    }))
  }))
})
</script>

<style lang="scss" scoped>
.bet-slip {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .selected-matches {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
    margin-bottom: 12px;

    .match-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .match-time {
      font-size: 12px;
      color: var(--van-gray-6);
    }

    .selected-option {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .option-name {
          min-width: 40px;
        }

        :deep(.van-stepper) {
          --van-stepper-input-height: 24px;
          --van-stepper-border-radius: 4px;
        }
      }
    }
  }

  .pass-type {
    margin-bottom: 12px;

    .pass-type-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px;
    }
  }

  .bet-multiple {
    margin-bottom: 12px;
  }

  .bet-footer {
    position: relative;
    margin-top: auto;
  }

  .bet-info {
    padding: 12px 0;
    background: var(--van-background-2);
  }

  .bet-actions {
    :deep() {
      .van-submit-bar {
        position: relative;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

        &__tip {
          padding: 8px 12px;
          color: var(--van-text-color-2);
          background: var(--van-background-2);
        }
      }
    }
  }
}

.bet-slip-header {
  padding: 12px 56px;
  text-align: right;
}
</style> 