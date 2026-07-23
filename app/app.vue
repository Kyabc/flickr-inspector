<script setup lang="ts">
import type { FileReadResult } from './composables/useFileParser'
import TagChart from './components/TagChart.vue'
import LocationMap from './components/LocationMap.client.vue'
import FileCountChart from './components/FileCountChart.vue'
import TimeHeatmap from './components/TimeHeatmap.vue'
import type { TimeBasis } from './composables/useFileParser'
import ReportExport from './components/ReportExport.vue'
import TimelineChart from './components/TimelineChart.vue'

const selectedFiles = ref<FileReadResult[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isReading = ref(false)
const { summary, timeZone, timeBasis, browserTimeZone, readFiles, resetSummary, setTimeZone, setTimeBasis } = useFileParser()
function hasField(field: keyof typeof summary.availableFields): boolean { return summary.availableFields[field] }

const errorFileCount = computed(() => selectedFiles.value.filter(file => file.status === 'エラー').length)

const timeZoneOptions = computed(() => {
  const options = [
    { value: 'Asia/Tokyo', label: '日本時間（Asia/Tokyo）' },
    { value: 'UTC', label: '協定世界時（UTC）' },
    { value: browserTimeZone, label: `この端末（${browserTimeZone}）` },
    { value: 'America/New_York', label: '米国東部（America/New_York）' },
    { value: 'Europe/London', label: 'ロンドン（Europe/London）' },
  ]
  return options.filter((option, index) => options.findIndex(item => item.value === option.value) === index)
})

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const files = Array.from(input.files)
  selectedFiles.value = files.map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    name: file.name,
    size: file.size,
    format: getFileFormat(file.name),
    recordCount: 0,
    invalidLineCount: 0,
    duplicateCount: 0,
    status: '待機中',
  }))
  isReading.value = true
  try { await readFiles(files, selectedFiles.value) }
  finally { isReading.value = false }
}

function handleTimeZoneChange(event: Event) { setTimeZone((event.target as HTMLSelectElement).value) }
function handleTimeBasisChange(event: Event) { setTimeBasis((event.target as HTMLSelectElement).value as TimeBasis) }
const selectedDateAvailable = computed(() => timeBasis.value === 'upload' ? summary.availableFields.date_upload : summary.availableFields.date_taken)
const timeBasisLabel = computed(() => timeBasis.value === 'upload' ? t('uploadDate') : t('takenDate'))

function getFileFormat(name: string): FileReadResult['format'] {
  const lower = name.toLowerCase()
  return lower.endsWith('.jsonl') || lower.endsWith('.ndjson') || lower.endsWith('.jsonlines') ? 'JSON Lines' : '不明'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function formatPercentage(count: number, total: number): string {
  return total === 0 ? '0.0%' : `${(count / total * 100).toFixed(1)}%`
}

function formatDate(date: Date | null): string {
  return date === null ? '不明' : new Intl.DateTimeFormat('ja-JP', {
    timeZone: timeZone.value,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function clearFiles() {
  selectedFiles.value = []
  resetSummary()
  if (fileInput.value) fileInput.value.value = ''
}

const { t, locale, setLocale } = useLanguage()
function handleLanguageChange(event: Event) { setLocale((event.target as HTMLSelectElement).value as 'ja' | 'en') }
function statusLabel(status: FileReadResult['status']) { return status === '完了' ? t('completed') : status === '待機中' ? t('waiting') : status === '読込中' ? t('loading') : t('error') }
</script>

<template>
  <div class="app">
    <header class="header"><div class="header__content"><div class="header__top"><p class="header__label">Flickr crawl data viewer</p><div class="language-switch" :aria-label="t('language')"><button type="button" :class="{ active: locale === 'ja' }" @click="setLocale('ja')">JP</button><button type="button" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button></div></div><h1>Flickr Inspector</h1><p class="header__description">{{ t('subtitle') }}</p></div></header>
    <main class="main">
      <section class="upload-panel">
        <div><h2>{{ t('loadFiles') }}</h2><p>{{ t('loadDescription') }}</p></div>
        <label class="file-button" :class="{ disabled: isReading }">{{ isReading ? t('reading') : t('chooseFiles') }}<input ref="fileInput" class="file-input" type="file" accept=".jsonl,.ndjson,.jsonlines,application/jsonl,application/x-ndjson" multiple :disabled="isReading" @change="handleFileChange"></label>
      </section>

      <section v-if="selectedFiles.length" class="result-panel">
        <div class="result-header">
          <div><h2>{{ t('results') }}</h2><p>{{ isReading ? t('processing') : t('filesChecked',{count:selectedFiles.length.toLocaleString()}) }}</p></div>
          <div class="result-actions">
            <label>{{ t('timeBasis') }}<select :value="timeBasis" @change="handleTimeBasisChange"><option value="upload" :disabled="!summary.availableFields.date_upload">{{ t('uploadDate') }}</option><option value="taken" :disabled="!summary.availableFields.date_taken">{{ t('takenDate') }}</option></select></label><label>{{ t('timezone') }}<select :value="timeZone" :disabled="isReading" @change="handleTimeZoneChange"><option v-for="option in timeZoneOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
            <ReportExport v-if="!isReading" :summary="summary" :files="selectedFiles" :time-zone="timeZone" :time-basis="timeBasis" /><button type="button" :disabled="isReading" @click="clearFiles">{{ t('clear') }}</button>
          </div>
        </div>

        <div class="summary-grid">
          <article><span>{{ t('fileCount') }}</span><strong>{{ selectedFiles.length.toLocaleString() }}</strong></article>
          <article><span>{{ t('totalPosts') }}</span><strong>{{ summary.totalRecords.toLocaleString() }}</strong></article>
          <article><span>{{ t('uniquePosts') }}</span><strong v-if="hasField('id')">{{ summary.uniquePostCount.toLocaleString() }}</strong><strong v-else class="not-available">{{ t('missing') }}</strong><small v-if="!hasField('id')">{{ t('idMissing') }}</small></article>
          <article><span>{{ t('uniqueOwners') }}</span><strong v-if="summary.ownerKeyUsed">{{ summary.uniqueOwnerCount.toLocaleString() }}</strong><strong v-else class="not-available">{{ t('missing') }}</strong><small v-if="summary.ownerKeyUsed">{{ t('ownerField',{field:summary.ownerKeyUsed}) }}</small><small v-else>{{ t('ownerMissing') }}</small></article>
          <article><span>{{ t('locationAvailable') }}</span><template v-if="hasField('geo')"><strong>{{ summary.locationCount.toLocaleString() }}</strong><small>{{ formatPercentage(summary.locationCount, summary.totalRecords) }}</small></template><template v-else><strong class="not-available">{{ t('missing') }}</strong><small>{{ t('geoMissing') }}</small></template></article>
          <article><span>{{ t('tagsAvailable') }}</span><template v-if="hasField('tags')"><strong>{{ summary.taggedPostCount.toLocaleString() }}</strong><small>{{ formatPercentage(summary.taggedPostCount, summary.totalRecords) }}</small></template><template v-else><strong class="not-available">{{ t('missing') }}</strong><small>{{ t('tagsMissing') }}</small></template></article>
          <article :class="{ warning: summary.duplicateCount > 0 }"><span>{{ t('duplicates') }}</span><template v-if="hasField('id')"><strong>{{ summary.duplicateCount.toLocaleString() }}</strong><small>{{ t('duplicateHelp') }}</small></template><template v-else><strong class="not-available">{{ t('missing') }}</strong><small>{{ t('idMissing') }}</small></template></article>
          <article :class="{ error: summary.invalidLineCount > 0 }"><span>{{ t('invalidLines') }}</span><strong>{{ summary.invalidLineCount.toLocaleString() }}</strong><small>{{ t('invalidHelp') }}</small></article>
        </div>

        <div class="period"><div><span>{{ t('period') }}</span><small>{{ t('timezoneDisplay',{zone:timeZone}) }}</small></div><strong v-if="selectedDateAvailable">{{ summary.earliestDateLabel ?? t('unknown') }} ～ {{ summary.latestDateLabel ?? t('unknown') }}</strong><strong v-else class="not-available">{{ t('selectedDateMissing') }}</strong></div>

        <section v-if="summary.duplicateCount || summary.invalidLineCount || summary.invalidUploadDateCount || errorFileCount" class="notice">
          <h3>{{ t('attention') }}</h3><ul>
            <li v-if="summary.duplicateCount">{{ t('duplicateNotice',{count:summary.duplicateCount.toLocaleString()}) }}</li>
            <li v-if="summary.invalidLineCount">{{ t('invalidFileLines',{count:summary.invalidLineCount.toLocaleString()}) }}</li>
            <li v-if="summary.invalidUploadDateCount">{{ t('invalidDateNotice',{basis:timeBasisLabel,count:summary.invalidUploadDateCount.toLocaleString()}) }}</li>
            <li v-if="errorFileCount">{{ t('failedFiles',{count:errorFileCount.toLocaleString()}) }}</li>
          </ul>
        </section>

        <TimelineChart v-if="selectedDateAvailable" :monthly-counts="summary.monthlyPostCounts" :yearly-counts="summary.yearlyPostCounts" :time-zone="timeZone" :basis-label="timeBasisLabel" /><TimeHeatmap v-if="selectedDateAvailable" :counts="summary.weekdayHourCounts" :basis-label="timeBasisLabel" />
        <TagChart v-if="hasField('tags')" :tags="summary.topTags" />
        <ClientOnly v-if="hasField('geo')">
          <LocationMap
            :points="summary.locationBins"
            :total-location-count="summary.locationCount"
          />
          <template #fallback><div class="map-fallback">{{ t('mapLoading') }}</div></template>
        </ClientOnly>

        <FileCountChart :files="selectedFiles" />

        <section class="files"><h3>{{ t('fileDetails') }}</h3><ul>
          <li v-for="file in selectedFiles" :key="file.id"><div><strong>{{ file.name }}</strong><p>{{ file.format }}・{{ formatFileSize(file.size) }}</p><p v-if="file.invalidLineCount" class="warn">{{ t('invalidFileLines',{count:file.invalidLineCount.toLocaleString()}) }}</p><p v-if="file.duplicateCount" class="warn">{{ t('duplicateFilePosts',{count:file.duplicateCount.toLocaleString()}) }}</p><p v-if="file.errorMessage" class="err">{{ file.errorMessage }}</p></div><aside><strong v-if="file.status !== '待機中'">{{ t('posts',{count:file.recordCount.toLocaleString()}) }}</strong><span :class="file.status">{{ statusLabel(file.status) }}</span></aside></li>
        </ul></section>
      </section>
      <section v-else class="empty"><p>{{ t('noFiles') }}</p><small>{{ t('supported') }}</small></section>
    </main>
  </div>
</template>

<style>
*{box-sizing:border-box}body{margin:0;color:#1f2937;background:#f5f7fa;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}.app{min-height:100vh}.header{padding:64px 24px 48px;color:#fff;background:#172554}.header__content{width:min(1040px,100%);margin:auto}.header__top{display:flex;align-items:center;justify-content:space-between;gap:20px}.language-switch{display:flex;padding:3px;border:1px solid rgb(191 219 254 / 55%);border-radius:9px;background:rgb(15 23 42 / 22%)}.language-switch button{min-width:42px;padding:7px 10px;border:0;border-radius:6px;color:#dbeafe;background:transparent;font-weight:700;cursor:pointer}.language-switch button.active{color:#172554;background:#fff}.header__label{margin:0 0 8px;color:#bfdbfe;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.header h1{margin:0;font-size:clamp(36px,6vw,56px)}.header__description{max-width:680px;margin:16px 0 0;color:#dbeafe;line-height:1.7}.main{display:grid;gap:24px;width:min(1040px,calc(100% - 32px));margin:-24px auto 0;padding-bottom:64px}.upload-panel,.result-panel,.empty{border:1px solid #e5e7eb;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgb(15 23 42 / 8%)}.upload-panel{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px}.upload-panel h2,.result-header h2{margin:0}.upload-panel p,.result-header p{margin:8px 0 0;color:#64748b;line-height:1.6}.file-button{flex-shrink:0;padding:12px 20px;border-radius:10px;color:#fff;background:#2563eb;font-weight:700;cursor:pointer}.file-button.disabled{opacity:.6}.file-input{display:none}.result-panel{padding:28px}.result-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:28px}.result-actions{display:flex;align-items:flex-end;gap:10px}.result-actions label{display:grid;gap:5px;color:#475569;font-size:12px}.result-actions select,.result-header button{min-height:38px;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}.result-header button{cursor:pointer}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summary-grid article{display:grid;align-content:start;gap:8px;min-height:118px;padding:16px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.summary-grid article.warning{border-color:#fcd34d;background:#fffbeb}.summary-grid article.error{border-color:#fca5a5;background:#fef2f2}.summary-grid span,.summary-grid small,.period span{color:#64748b;font-size:13px}.summary-grid strong{font-size:26px}.summary-grid strong.not-available,.period strong.not-available{color:#64748b;font-size:15px}.period{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:12px;padding:18px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.period>div{display:grid;gap:4px}.period small{color:#64748b;font-size:12px}.notice{margin-top:28px;padding:18px;border:1px solid #fde68a;border-radius:10px;background:#fffbeb}.notice h3,.files h3{margin:0 0 16px;font-size:17px}.notice ul{display:grid;gap:8px;margin:0;padding-left:22px;color:#78350f}.files{margin-top:28px}.files ul{display:grid;gap:10px;margin:0;padding:0;list-style:none}.files li{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px;border:1px solid #e2e8f0;border-radius:10px}.files p{margin:5px 0 0;color:#64748b;font-size:13px}.files .warn{color:#b45309}.files .err{color:#b91c1c}.files aside{display:grid;flex-shrink:0;justify-items:end;gap:6px}.files aside span{padding:4px 9px;border-radius:999px;background:#e2e8f0;font-size:12px;font-weight:700}.files aside span.完了{color:#166534;background:#dcfce7}.files aside span.読込中{color:#1d4ed8;background:#dbeafe}.files aside span.エラー{color:#b91c1c;background:#fee2e2}.map-fallback{margin-top:28px;padding:80px;border:1px dashed #cbd5e1;border-radius:10px;color:#64748b;text-align:center}.empty{padding:40px;text-align:center;color:#64748b}.empty p{margin:0}.empty small{display:block;margin-top:8px}@media(max-width:840px){.summary-grid{grid-template-columns:repeat(2,1fr)}.result-header{flex-direction:column}.result-actions{width:100%}}@media(max-width:640px){.upload-panel,.period,.files li{align-items:stretch;flex-direction:column}.file-button{text-align:center}.result-actions{align-items:stretch;flex-direction:column}.files aside{justify-items:start}}@media(max-width:440px){.summary-grid{grid-template-columns:1fr}}
</style>
