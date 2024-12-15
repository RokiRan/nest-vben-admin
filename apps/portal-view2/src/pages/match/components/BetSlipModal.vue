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
        <van-swipe-cell v-for="match in selectedMatches" :key="match.match_id">
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
                  <span class="option-odds">@ {{ option.odds }}</span>
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
            <van-stepper v-model="multiple" min="1" />
          </template>
        </van-cell>
      </div>

      <!-- 投注信息 -->
      <div class="bet-info">
        <van-cell title="注数" :value="`${betCount}注`" />
        <van-cell title="单注金额" value="2元" />
        <van-cell title="总金额" :value="`${totalAmount}元`" />
        <van-cell title="预计奖金" :value="`${minBonus}~${maxBonus}元`" />
      </div>

      <!-- 底部按钮 -->
      <div class="bet-actions">
        <van-submit-bar
          :price="totalAmount * 100"
          button-text="确认投注"
          @submit="handleSubmit">
          <template #tip>
            预计奖金：{{ minBonus }}~{{ maxBonus }}元
          </template>
        </van-submit-bar>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

// 计算属性
const betCount = computed(() => {
  // TODO: 根据选中的比赛和过关方式计算注数
  return 42
})

const totalAmount = computed(() => {
  return betCount.value * 2 * multiple.value
})

const minBonus = computed(() => {
  // TODO: 计算最小奖金
  return '9.23'
})

const maxBonus = computed(() => {
  // TODO: 计算最大奖金
  return '4362.46'
})

// 方法
const clearAll = () => {
  // TODO: 清空所有选择
}

const removeMatch = (match) => {
  // TODO: 移除单场比赛
}

const isPassTypeAvailable = (type: string) => {
  const matchCount = props.selectedMatches.length
  const passCount = parseInt(type)
  return matchCount >= passCount
}

const handleSubmit = () => {
  const betData = {
    matches: props.selectedMatches,
    passTypes: selectedPassTypes.value,
    multiple: multiple.value,
    betCount: betCount.value,
    totalAmount: totalAmount.value
  }
  emit('submit', betData)
}

const onOpen = () => {
  const count = props.selectedMatches.length
  if (count > 8) {
    selectedPassTypes.value = ['8串1']
  } else {
    selectedPassTypes.value = [`${count}串1`]
  }
}
</script>

<style lang="scss" scoped>
.bet-slip {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bet-slip-header {
  padding: 12px 56px;
  text-align: right;
  border-bottom: 1px solid var(--van-gray-2);
}

.selected-matches {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;

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
      gap: 4px;
    }

    .option-odds {
      color: var(--van-danger-color);
      font-size: 12px;
    }
  }
}

.bet-info {
  border-top: 1px solid var(--van-gray-2);
  padding: 12px 0;
}

.bet-actions {
  padding-bottom: var(--van-safe-area-bottom);
}

.pass-type {
  padding: 12px;
  
  .pass-type-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 16px;
  }
}
</style> 