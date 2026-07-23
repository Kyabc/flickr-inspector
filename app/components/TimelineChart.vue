<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  monthlyCounts: Record<string, number>
  yearlyCounts: Record<string, number>
  timeZone: string
  basisLabel: string
}>()

const unit = ref<'month' | 'year'>('month')
const entries = computed(() => {
  const source = unit.value === 'month' ? props.monthlyCounts : props.yearlyCounts
  return Object.entries(source).sort(([a], [b]) => a.localeCompare(b))
})

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: entries.value.map(([label]) => label),
  datasets: [{
    label: unit.value === 'month' ? t('monthly') : t('yearly'),
    data: entries.value.map(([, count]) => count),
    backgroundColor: '#2563eb',
    borderRadius: 4,
    maxBarThickness: 42,
  }],
}))

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: context => `${Number(context.raw).toLocaleString()}件` } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 0 } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

const { t, locale } = useLanguage()
</script>

<template>
  <section class="chart-panel">
    <div class="chart-header">
      <div>
        <h3>{{ t('timeline') }}</h3>
        <p>{{ t('timelineHelp',{basis:basisLabel}) }}<template v-if="basisLabel === t('uploadDate')"> {{ t('timezone') }}: {{ timeZone }}</template></p>
      </div>
      <div class="unit-switch" aria-label="集計単位">
        <button type="button" :class="{ active: unit === 'month' }" @click="unit = 'month'">{{ t('monthly') }}</button>
        <button type="button" :class="{ active: unit === 'year' }" @click="unit = 'year'">{{ t('yearly') }}</button>
      </div>
    </div>
    <div v-if="entries.length > 0" class="chart-area"><Bar :data="chartData" :options="chartOptions" /></div>
    <p v-else class="chart-empty">{{ t('noDates') }}</p>
  </section>
</template>

<style scoped>
.chart-panel{margin-top:28px}.chart-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}h3{margin:0;color:#0f172a;font-size:17px}p{margin:6px 0 0;color:#64748b;font-size:13px}.unit-switch{display:flex;padding:3px;border:1px solid #cbd5e1;border-radius:9px;background:#f8fafc}.unit-switch button{padding:7px 12px;border:0;border-radius:6px;color:#475569;background:transparent;cursor:pointer}.unit-switch button.active{color:white;background:#2563eb}.chart-area{position:relative;height:360px;padding:16px;border:1px solid #e2e8f0;border-radius:10px}.chart-empty{padding:40px;border:1px dashed #cbd5e1;border-radius:10px;text-align:center}@media(max-width:640px){.chart-header{flex-direction:column}.chart-area{height:300px}}
</style>
