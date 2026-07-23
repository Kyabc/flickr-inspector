<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip, type ChartData, type ChartOptions } from 'chart.js'
import type { FileReadResult } from '../composables/useFileParser'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
const props = defineProps<{ files: FileReadResult[] }>()
const sort = ref<'name' | 'selected' | 'desc' | 'asc'>('name')
const sortedFiles = computed(() => {
  const indexed = props.files.map((file, index) => ({ file, index }))
  if (sort.value === 'name') indexed.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }))
  if (sort.value === 'desc') indexed.sort((a, b) => b.file.recordCount - a.file.recordCount)
  if (sort.value === 'asc') indexed.sort((a, b) => a.file.recordCount - b.file.recordCount)
  return indexed.map(item => item.file)
})
const chartData = computed<ChartData<'bar'>>(() => ({
  labels: sortedFiles.value.map(file => file.name),
  datasets: [
    { label: t('validPosts'), data: sortedFiles.value.map(file => file.recordCount), backgroundColor: '#2563eb' },
    { label: t('invalidLines'), data: sortedFiles.value.map(file => file.invalidLineCount), backgroundColor: '#dc2626' },
    { label: t('duplicates'), data: sortedFiles.value.map(file => file.duplicateCount), backgroundColor: '#d97706' },
  ],
}))
const chartOptions: ChartOptions<'bar'> = {
  responsive: true, maintainAspectRatio: false, animation: false,
  plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${Number(context.raw).toLocaleString()}件` } } },
  scales: { x: { stacked: false, ticks: { maxRotation: 45, minRotation: 0 } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
}
const chartWidth = computed(() => Math.max(900, sortedFiles.value.length * 55))

const { t, locale } = useLanguage()
</script>

<template>
  <section class="file-chart-panel">
    <div class="file-chart-header">
      <div><h3>{{ t('fileChart') }}</h3><p>{{ t('fileChartHelp') }}</p></div>
      <label>{{ t('order') }}<select v-model="sort"><option value="name">{{ t('nameOrder') }}</option><option value="selected">{{ t('selectedOrder') }}</option><option value="desc">{{ t('descOrder') }}</option><option value="asc">{{ t('ascOrder') }}</option></select></label>
    </div>
    <div class="file-chart-scroll"><div class="file-chart" :style="{ width: `${chartWidth}px` }"><Bar :data="chartData" :options="chartOptions" /></div></div>
  </section>
</template>

<style scoped>
.file-chart-panel{margin-top:28px}.file-chart-header{display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}h3{margin:0;font-size:17px}p{margin:6px 0 0;color:#64748b;font-size:13px}.file-chart-header label{display:flex;align-items:center;gap:8px;color:#475569;font-size:13px}.file-chart-header select{padding:7px 9px;border:1px solid #cbd5e1;border-radius:7px;background:#fff}.file-chart-scroll{overflow-x:auto;border:1px solid #e2e8f0;border-radius:10px}.file-chart{height:360px;padding:16px}@media(max-width:640px){.file-chart-header{flex-direction:column}.file-chart-header label{align-self:flex-start}}
</style>
