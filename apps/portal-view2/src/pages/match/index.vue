<template>
  <div class="min-h-90vh bg-light-100 dark:bg-dark-800 pb-50px">
    <!-- 头部选择区 -->
    <!-- <van-sticky>
      <div class="header">
        <div class="bg-white dark:bg-dark-700 border-b border-gray-100 dark:border-dark-600">
          <van-dropdown-menu>
            <van-dropdown-item v-model="playType" :options="playTypes" />
          </van-dropdown-menu>
        </div>
      </div>
    </van-sticky> -->

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
      @submit="handleBetNextSubmit">
      <template #tip>
        <van-icon name="delete-o" style="margin-right: 4px;" />
        已选{{ selectedMatches.length }}场
      </template>
    </van-submit-bar>

    <!-- 投注单弹窗 -->
    <bet-slip-modal
      v-model:show="showBetSlip"
      :selected-matches="selectedMatches"
      @update-dan="handleUpdateDan"
      @submit="handleBetSubmit"
      @cancel="handleBetCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { getTodayMatches, createBetOrder } from '@/api/football'
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
const selectedMatches = ref<Array<any>>([])

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
const handleBetNextSubmit = () => {
    // 至少存在2场
    if (selectedMatches.value.length < 2) {
        showToast('至少选择2场比赛')
        return
    }
    // 需要检查同一场内是否存在不同的玩法
    // 先按照比赛分组，然后检查每组内是否存在不同的玩法
    const groupedMatches = selectedMatches.value.reduce((acc, match) => {
        acc[match.match_id] = match
        return acc
    }, {})
    console.log(groupedMatches)
    const noDifferentPlayTypeInOneMatch = Object.values(groupedMatches).every(
        match => {
            const options = match.options
            if (options.length === 0 || options.length === 1) {
                return true
            }
            return options.every(option => option.type === options[0].type)
        }
    )
    if (!noDifferentPlayTypeInOneMatch) {
      showToast('同一场内存在不同的玩法')
      return
    }
  showBetSlip.value = true
}

// 选择比赛
const handleMatchSelect = (match, option) => {
  const index = selectedMatches.value.findIndex(m => m.match_id === match.match_id)
  
  // 如果是新增比赛，先检查是否超过限制
  if (index === -1 && selectedMatches.value.length >= 8) {
    showToast('最多只能选择8场比赛')
    return
  }

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
  // 转换投注数据格式
  const details = betData.matches.map(match => {
    return match.options.map(option => ({
      matchId: match.match_id,
      bettingOptionCode: option.code,
      odds: Number(option.odds),
      isDan: match.isDan
    }))
  }).flat()
  const orderData = {
    details,
    matchCount: betData.matches.length,
    passType: betData.passTypes.map(type => type.replace(/串1/g, '')).join(''),
    playType: betData.playType,
    multiple: betData.multiple,
    amount: betData.totalAmount,
    bonus: Number(betData.maxBonus),
    strip: betData.strip,
  }

  createBetOrder(orderData).then(res => {
    console.log(res)
  }).then(() => {
    showToast('投注成功')
    // 清理投注数据
    selectedMatches.value = []
  }).catch(err => {
    showToast(err.message)
  }).finally(() => {
    showBetSlip.value = false
  })
}

// 取消投注
const handleBetCancel = () => {
  showBetSlip.value = false
}

// 处理胆码更新
const handleUpdateDan = (matchId: number, isDan: boolean) => {
  const match = selectedMatches.value.find(m => m.match_id === matchId);
  if (match) {
    match.isDan = isDan;
  }
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