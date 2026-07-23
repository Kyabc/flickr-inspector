<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LocationBin } from '../composables/useFileParser'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  points: LocationBin[]
  totalLocationCount: number
}>()

const mapElement = ref<HTMLDivElement | null>(null)
const mode = ref<'heat' | 'points'>('heat')
const cellSize = ref(0.001)
const pointLimit = ref(20000)
let leaflet: any = null
let map: any = null
let dataLayer: any = null
let initialBounds: any = null

const cellOptions = [
  { value: 0.0003, label: '約30m' },
  { value: 0.0005, label: '約50m' },
  { value: 0.001, label: '約100m' },
  { value: 0.002, label: '約200m' },
  { value: 0.005, label: '約500m' },
]

const aggregatedPoints = computed<LocationBin[]>(() => {
  const bins = new Map<string, LocationBin>()
  const decimals = cellSize.value <= 0.0003 ? 5 : cellSize.value <= 0.0005 ? 4 : 3

  for (const point of props.points) {
    const latitude = Math.round(point.latitude / cellSize.value) * cellSize.value
    const longitude = Math.round(point.longitude / cellSize.value) * cellSize.value
    const key = `${latitude.toFixed(decimals)},${longitude.toFixed(decimals)}`
    const current = bins.get(key)
    if (current) current.count += point.count
    else bins.set(key, { latitude, longitude, count: point.count })
  }

  return Array.from(bins.values()).sort((a, b) => b.count - a.count)
})

const normalizedPointLimit = computed(() => {
  if (!Number.isFinite(pointLimit.value)) return 20000
  return Math.min(500000, Math.max(100, Math.round(pointLimit.value)))
})

const visiblePoints = computed(() => aggregatedPoints.value.slice(0, normalizedPointLimit.value))
const displayedPostCount = computed(() => visiblePoints.value.reduce((total, point) => total + point.count, 0))
const omittedPostCount = computed(() => Math.max(0, props.totalLocationCount - displayedPostCount.value))
const omittedPointCount = computed(() => Math.max(0, aggregatedPoints.value.length - visiblePoints.value.length))

async function initializeMap() {
  if (!mapElement.value || map) return
  leaflet = await import('leaflet')
  ;(window as any).L = leaflet
  await import('leaflet.heat')

  map = leaflet.map(mapElement.value, { preferCanvas: true })
  leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  renderData()
}

function renderData() {
  if (!map || !leaflet) return
  if (dataLayer) {
    map.removeLayer(dataLayer)
    dataLayer = null
  }

  if (visiblePoints.value.length === 0) {
    initialBounds = null
    map.setView([35.6812, 139.7671], 10)
    return
  }

  initialBounds = leaflet.latLngBounds(
    visiblePoints.value.map(point => [point.latitude, point.longitude]),
  )

  if (mode.value === 'heat') {
    const maximum = Math.max(...visiblePoints.value.map(point => point.count), 1)
    dataLayer = (leaflet as any).heatLayer(
      visiblePoints.value.map(point => [point.latitude, point.longitude, point.count]),
      { radius: 24, blur: 18, max: maximum, minOpacity: 0.25 },
    ).addTo(map)
  } else {
    dataLayer = leaflet.layerGroup(
      visiblePoints.value.map(point => leaflet.circleMarker([point.latitude, point.longitude], {
        radius: Math.min(14, 4 + Math.log2(point.count + 1)),
        weight: 1,
        color: '#075985',
        fillColor: '#0891b2',
        fillOpacity: 0.55,
      }).bindPopup(`${point.count.toLocaleString()}件の投稿`)),
    ).addTo(map)
  }

  resetView()
}

function commitPointLimit() {
  pointLimit.value = normalizedPointLimit.value
}

function resetView() {
  if (!map || !initialBounds || !initialBounds.isValid()) return
  map.fitBounds(initialBounds, { padding: [24, 24], maxZoom: 16 })
}

watch(visiblePoints, renderData, { deep: false })
watch(mode, renderData)
onMounted(initializeMap)
onBeforeUnmount(() => {
  if (map) map.remove()
  map = null
})

const { t, locale } = useLanguage()
</script>

<template>
  <section class="location-panel">
    <div class="location-header">
      <div>
        <h3>{{ t('locationMap') }}</h3>
        <p>{{ t('mapHelp',{count:totalLocationCount.toLocaleString()}) }}</p>
      </div>
      <div class="map-actions">
        <div class="mode-switch" aria-label="地図の表示方法">
          <button type="button" :class="{ active: mode === 'heat' }" @click="mode = 'heat'">{{ t('heatmap') }}</button>
          <button type="button" :class="{ active: mode === 'points' }" @click="mode = 'points'">{{ t('points') }}</button>
        </div>
        <button type="button" class="reset-button" @click="resetView">{{ t('showAll') }}</button>
      </div>
    </div>

    <div class="map-settings">
      <label>
        {{ t('cellSize') }}
        <select v-model.number="cellSize">
          <option v-for="option in cellOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label>
        {{ t('mapPointLimit') }}
        <input v-model.number="pointLimit" type="number" min="100" max="500000" step="100" @change="commitPointLimit">
      </label>
      <span>{{ t('settingRange') }}</span>
    </div>

    <div ref="mapElement" class="map" />

    <div class="map-summary">
      <span>{{ t('aggregatedPoints',{count:aggregatedPoints.length.toLocaleString()}) }}</span>
      <span>{{ t('displayedPoints',{count:visiblePoints.length.toLocaleString()}) }}</span>
      <span>{{ t('displayedPosts',{count:displayedPostCount.toLocaleString()}) }}</span>
      <span v-if="omittedPointCount > 0">{{ t('omittedPoints',{count:omittedPointCount.toLocaleString()}) }}</span>
      <span v-if="omittedPostCount > 0">{{ t('omittedPosts',{count:omittedPostCount.toLocaleString()}) }}</span>
    </div>
  </section>
</template>

<style scoped>
.location-panel{margin-top:28px}.location-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}h3{margin:0;color:#0f172a;font-size:17px}p{margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.6}.map-actions{display:flex;gap:8px}.mode-switch{display:flex;padding:3px;border:1px solid #cbd5e1;border-radius:9px;background:#f8fafc}.mode-switch button,.reset-button{padding:7px 11px;border:0;border-radius:6px;color:#475569;background:transparent;cursor:pointer}.mode-switch button.active{color:white;background:#2563eb}.reset-button{border:1px solid #cbd5e1;background:white}.map-settings{display:flex;align-items:end;flex-wrap:wrap;gap:12px;margin-bottom:12px;padding:12px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc}.map-settings label{display:grid;gap:5px;color:#475569;font-size:12px}.map-settings select,.map-settings input{min-height:36px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:7px;background:white}.map-settings input{width:150px}.map-settings span{padding-bottom:9px;color:#64748b;font-size:12px}.map{height:480px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}.map-summary{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:10px;color:#64748b;font-size:12px}@media(max-width:720px){.location-header,.map-actions{flex-direction:column}.map{height:380px}}
</style>
