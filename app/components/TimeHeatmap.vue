<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ counts: number[][], basisLabel: string }>()
const { t } = useLanguage()
const weekdays = computed(() => [t('sunday'),t('monday'),t('tuesday'),t('wednesday'),t('thursday'),t('friday'),t('saturday')])
const maximum = computed(() => Math.max(1, ...props.counts.flat()))
const detail = ref('')
function color(value:number){ return value===0?'#f1f5f9':`rgba(37,99,235,${0.18+value/maximum.value*0.82})` }
function show(day:string, hour:number, count:number){ detail.value=`${day} ${hour}:00 · ${count.toLocaleString()} ${t('posts',{count:''}).trim()}` }
</script>
<template><section class="time-heatmap"><h3>{{ t('timeHeatmap') }}</h3><p>{{ t('timeHeatmapHelp',{basis:basisLabel}) }}</p><div class="detail" aria-live="polite">{{ detail || t('hoverPrompt') }}</div><div class="scroll"><div class="grid"><div class="corner"/><div v-for="hour in 24" :key="hour" class="hour">{{hour-1}}</div><template v-for="(day,di) in weekdays" :key="day"><div class="day">{{day}}</div><button v-for="hour in 24" :key="`${day}-${hour}`" type="button" class="cell" :style="{backgroundColor:color(counts[di]?.[hour-1]??0)}" @mouseenter="show(day,hour-1,counts[di]?.[hour-1]??0)" @focus="show(day,hour-1,counts[di]?.[hour-1]??0)" @click="show(day,hour-1,counts[di]?.[hour-1]??0)"/></template></div></div></section></template>
<style scoped>.time-heatmap{margin-top:28px}h3{margin:0;font-size:17px}p{margin:6px 0 10px;color:#64748b;font-size:13px}.detail{min-height:34px;margin-bottom:10px;padding:8px 12px;border-radius:7px;color:#334155;background:#f1f5f9;font-size:13px}.scroll{overflow-x:auto;padding-bottom:6px}.grid{display:grid;grid-template-columns:38px repeat(24,28px);gap:3px;min-width:750px}.hour,.day{display:grid;place-items:center;color:#64748b;font-size:11px}.cell{width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:3px;cursor:pointer}.cell:hover,.cell:focus{border-color:#0f172a;outline:none}.corner{height:20px}</style>
