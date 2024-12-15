<template>
  <div class="min-h-90vh bg-light-100 dark:bg-dark-800 pb-50px">
    <!-- 头部选择区 -->
    <van-sticky>
      <div class="header">
        <div class="bg-white dark:bg-dark-700 border-b border-gray-100 dark:border-dark-600">
          <van-dropdown-menu>
            <van-dropdown-item v-model="playType" :options="playTypes" />
          </van-dropdown-menu>
        </div>
      </div>
    </van-sticky>

    <!-- 比赛列表 -->
    <match-list 
      :matches="matches" 
      :selected-matches="selectedMatches"
      @select="handleMatchSelect" />

    <!-- 底部投注栏 -->
    <van-submit-bar
      v-if="selectedMatches.length > 0"
      :button-text="'选好了'"
      button-color="#d81e06"
      @submit="showBetSlip = true">
      <template #tip>
        <van-icon name="delete-o" style="margin-right: 4px;" />
        已选{{ selectedMatches.length }}场
      </template>
    </van-submit-bar>

    <!-- 投注单弹窗 -->
    <bet-slip-modal
      v-model:show="showBetSlip"
      :selected-matches="selectedMatches"
      @submit="handleBetSubmit"
      @cancel="handleBetCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { getTodayMatches } from '@/api/football'
import MatchList from './components/MatchList.vue'
import BetSlipModal from './components/BetSlipModal.vue'

// 日期选择
const dates = [
  { label: '今日', value: 'today' },
  { label: '明日', value: 'tomorrow' },
]
const currentDate = ref('today')

// 玩法选择
const playTypes = [
  { text: '混合过关', value: 'HHGG' }
]
const playType = ref('HHGG')

// 比赛数据
const matches = ref([])
const selectedMatches = ref([])

// 投注单控制
const showBetSlip = ref(false)

// 获取比赛数据
const fetchMatches = async () => {
  try {
    const res = await getTodayMatches()
    matches.value = res.data
  } catch (error) {
    showToast('获取比赛数据失败')
  }
}

// 选择比赛
const handleMatchSelect = (match, option) => {
  const index = selectedMatches.value.findIndex(m => m.match_id === match.match_id)
  if (index > -1) {
    // 找到已选择的选项索引
    const optionIndex = selectedMatches.value[index].options.findIndex(
      o => o.code === option.code
    )
    
    if (optionIndex > -1) {
      // 如果选项已存在，则移除
      selectedMatches.value[index].options.splice(optionIndex, 1)
      // 如果没有选项了，则移除整个比赛
      if (selectedMatches.value[index].options.length === 0) {
        selectedMatches.value.splice(index, 1)
      }
    } else {
      // 如果选项不存在，则添加
      selectedMatches.value[index].options.push(option)
    }
  } else {
    // 如果比赛不存在，则添加新的比赛和选项
    selectedMatches.value.push({
      ...match,
      options: [option]
    })
  }
}

// 投注提交
const handleBetSubmit = (betData) => {
  // TODO: 调用投注API
  showBetSlip.value = false
}

// 取消投注
const handleBetCancel = () => {
  showBetSlip.value = false
}

onMounted(() => {
  fetchMatches()
})
</script>

<style lang="scss" scoped>
.header {
  :deep() {
    .van-tabs {
      @apply bg-white dark:bg-dark-700;
      
      .van-tab {
        @apply flex-1 text-13px text-gray-600 dark:text-gray-300;
        
        &--active {
          @apply text-red-600 dark:text-red-400;
        }
      }

      .van-tabs__line {
        @apply bg-red-600 dark:bg-red-400;
      }
    }
  }

  .play-type {
    :deep() {
      .van-dropdown-menu {
        --van-dropdown-menu-height: 40px;
        --van-dropdown-menu-title-text-color: theme('colors.red.600');
        --van-dropdown-menu-title-active-text-color: theme('colors.red.600');
      }

      .van-dropdown-menu__bar {
        box-shadow: none;
      }
    }
  }
}

:deep() {
  .van-submit-bar {
    --van-submit-bar-price-color: theme('colors.red.600');
    --van-submit-bar-button-height: 40px;
    
    .van-submit-bar__tip {
      @apply bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300;
    }
  }
}
</style>

<route lang="json5">
{
    name: 'match',
    meta: {
      title: '竞彩足球',
      i18n: 'menus.match'
    }
}
</route>