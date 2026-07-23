<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import type { TagCount } from '../composables/useFileParser'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{ tags: TagCount[] }>()
const limit = ref(20)
const visibleTags = computed(() => props.tags.slice(0, limit.value))
const chartHeight = computed(() => Math.max(360, visibleTags.value.length * 28 + 50))

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: visibleTags.value.map(item => item.tag),
  datasets: [{
    label: 'タグが付いている投稿数',
    data: visibleTags.value.map(item => item.count),
    backgroundColor: '#0891b2',
    borderRadius: 4,
    maxBarThickness: 22,
  }],
}))

const chartOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => `${Number(context.raw).toLocaleString()}件の投稿` } },
  },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { grid: { display: false } },
  },
}

const { t, locale } = useLanguage()
</script>

<template>
  <section class="tag-panel">
    <div class="tag-header">
      <div>
        <h3>{{ t('tagChart') }}</h3>
        <p>{{ t('tagHelp') }}</p>
      </div>
      <label>{{ t('displayCount') }}
        <select v-model.number="limit">
          <option :value="10">10件</option>
          <option :value="20">20件</option>
          <option :value="30">30件</option>
          <option :value="50">50件</option>
        </select>
      </label>
    </div>
    <div v-if="visibleTags.length > 0" class="tag-chart" :style="{ height: `${chartHeight}px` }">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="tag-empty">{{ t('noTags') }}</p>
  </section>
</template>

<style scoped>
.tag-panel{margin-top:28px}.tag-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}h3{margin:0;color:#0f172a;font-size:17px}p{margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.6}.tag-header label{display:flex;align-items:center;gap:8px;flex-shrink:0;color:#475569;font-size:13px}.tag-header select{padding:7px 9px;border:1px solid #cbd5e1;border-radius:7px;background:white}.tag-chart{position:relative;padding:16px;border:1px solid #e2e8f0;border-radius:10px}.tag-empty{padding:40px;border:1px dashed #cbd5e1;border-radius:10px;text-align:center}@media(max-width:640px){.tag-header{flex-direction:column}}
</style>
