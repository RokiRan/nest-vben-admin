<template>
  <div class="match-list text-gray-800 dark:text-gray-200">
    <match-item
        v-for="match in matches"
        :key="match.match_id"
        :match="match"
        :selected-options="getSelectedOptions(match)"
        @select="handleSelect" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MatchItem from './MatchItem.vue'

const props = defineProps({
  matches: {
    type: Array,
    default: () => []
  },
  selectedMatches: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

// 获取已选择的选项
const getSelectedOptions = (match) => {
  const selected = props.selectedMatches.find(m => m.match_id === match.match_id)
  return selected?.options || []
}

// 处理选择
const handleSelect = (match, option) => {
  emit('select', match, option)
}
</script>

<style lang="scss" scoped>
.match-list {
  padding: 12px 0;
}

:deep(.van-cell-group__title) {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  @apply text-gray-800 dark:text-gray-200;
}
</style> 