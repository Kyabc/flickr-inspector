<script setup lang="ts">
import type { DataSummary, FileReadResult } from '../composables/useFileParser'

const props = defineProps<{
  summary: DataSummary
  files: FileReadResult[]
  timeZone: string
  timeBasis: 'upload' | 'taken'
}>()

const { t, locale } = useLanguage()

type ReportText = {
  createdAt: string
  timeBasis: string
  uploadDate: string
  takenDate: string
  timeZone: string
  overview: string
  files: string
  totalPosts: string
  uniquePosts: string
  uniqueOwners: string
  ownerField: string
  withLocation: string
  withTags: string
  duplicatePosts: string
  invalidLines: string
  dateRange: string
  monthlyPosts: string
  frequentTags: string
  fileCounts: string
  file: string
  size: string
  posts: string
  unavailable: string
  dateUnavailable: string
  tagsUnavailable: string
  noMap: string
}

const reportTexts: Record<'ja' | 'en', ReportText> = {
  ja: {
    createdAt: '作成日時',
    timeBasis: '時間の基準',
    uploadDate: '投稿日',
    takenDate: '撮影日',
    timeZone: 'タイムゾーン',
    overview: '概要',
    files: 'ファイル数',
    totalPosts: '総投稿数',
    uniquePosts: 'ユニーク投稿数',
    uniqueOwners: 'ユニーク投稿者数',
    ownerField: '集計項目',
    withLocation: '位置情報あり',
    withTags: 'タグあり',
    duplicatePosts: '重複投稿',
    invalidLines: '不正な行',
    dateRange: '投稿期間',
    monthlyPosts: '月ごとの投稿数',
    frequentTags: '頻出タグ',
    fileCounts: 'ファイルごとの件数',
    file: 'ファイル',
    size: 'サイズ',
    posts: '投稿数',
    unavailable: '未取得（extrasで未指定）',
    dateUnavailable: '選択した日時を取得していないため表示できません。',
    tagsUnavailable: 'tagsを取得していないため表示できません。',
    noMap: 'このレポートに地図と元データは含まれていません。',
  },
  en: {
    createdAt: 'Created at',
    timeBasis: 'Time basis',
    uploadDate: 'Upload date',
    takenDate: 'Date taken',
    timeZone: 'Time zone',
    overview: 'Overview',
    files: 'Files',
    totalPosts: 'Total posts',
    uniquePosts: 'Unique posts',
    uniqueOwners: 'Unique owners',
    ownerField: 'Counted by',
    withLocation: 'With location',
    withTags: 'With tags',
    duplicatePosts: 'Duplicate posts',
    invalidLines: 'Invalid lines',
    dateRange: 'Date range',
    monthlyPosts: 'Monthly post count',
    frequentTags: 'Frequent tags',
    fileCounts: 'Counts by file',
    file: 'File',
    size: 'Size',
    posts: 'Posts',
    unavailable: 'Not retrieved through extras',
    dateUnavailable: 'The selected date field was not retrieved, so this section cannot be displayed.',
    tagsUnavailable: 'The tags field was not retrieved, so this section cannot be displayed.',
    noMap: 'This report does not include the map or the source data.',
  },
}

function escapeHtml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[character] ?? character,
  )
}

function percentage(count: number): string {
  if (props.summary.totalRecords === 0) return '0.0%'
  return `${(count / props.summary.totalRecords * 100).toFixed(1)}%`
}

function available(
  key: keyof DataSummary['availableFields'],
): boolean {
  return props.summary.availableFields[key]
}

function metric(
  value: string,
  isAvailable: boolean,
  text: ReportText,
): string {
  return isAvailable ? value : text.unavailable
}

function bars(
  items: Array<{ label: string, value: number }>,
  color: string,
): string {
  const maximum = Math.max(
    ...items.map(item => item.value),
    1,
  )

  return items.map(item => `
    <div class="bar-row">
      <span>${escapeHtml(item.label)}</span>
      <div class="bar-track">
        <i style="width:${item.value / maximum * 100}%;background:${color}"></i>
      </div>
      <strong>${item.value.toLocaleString()}</strong>
    </div>
  `).join('')
}

function exportReport(): void {
  const reportLocale = locale.value
  const text = reportTexts[reportLocale]

  const dateLocale = reportLocale === 'ja'
    ? 'ja-JP'
    : 'en-US'

  const createdAt = new Intl.DateTimeFormat(dateLocale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: props.timeZone,
  }).format(new Date())

  const monthly = Object.entries(
    props.summary.monthlyPostCounts,
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => ({ label, value }))

  const tags = props.summary.topTags
    .slice(0, 20)
    .map(item => ({
      label: item.tag,
      value: item.count,
    }))

  const fileRows = [...props.files].sort(
    (left, right) => left.name.localeCompare(
      right.name,
      undefined,
      { numeric: true },
    ),
  )

  const dateAvailable = props.timeBasis === 'upload'
    ? available('date_upload')
    : available('date_taken')

  const selectedTimeBasis = props.timeBasis === 'upload'
    ? text.uploadDate
    : text.takenDate

  const uniqueOwnerValue = metric(
    props.summary.uniqueOwnerCount.toLocaleString(),
    Boolean(props.summary.ownerKeyUsed),
    text,
  )

  const ownerFieldNote = props.summary.ownerKeyUsed
    ? `<small>${escapeHtml(text.ownerField)}: ${escapeHtml(props.summary.ownerKeyUsed)}</small>`
    : ''

  const dateRange = dateAvailable
    && props.summary.earliestDateLabel
    && props.summary.latestDateLabel
      ? `${props.summary.earliestDateLabel} – ${props.summary.latestDateLabel}`
      : text.unavailable

  const html = `<!doctype html>
<html lang="${reportLocale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Flickr Inspector Report</title>
  <style>
    body{margin:0;padding:40px;color:#1f2937;font:14px system-ui,sans-serif;background:#f8fafc}
    main{max-width:1100px;margin:auto}
    .hero{padding:28px;color:white;background:#172554;border-radius:14px}
    h1{margin:0}
    h2{margin-top:32px}
    .meta{color:#64748b}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .card{padding:15px;border:1px solid #e2e8f0;border-radius:9px;background:white}
    .card span{display:block;color:#64748b;font-size:12px}
    .card strong{display:block;margin-top:7px;font-size:20px}
    .card small{display:block;margin-top:5px;color:#64748b}
    .bar-row{display:grid;grid-template-columns:minmax(120px,220px) 1fr 80px;align-items:center;gap:10px;margin:8px 0}
    .bar-track{height:18px;background:#e2e8f0;border-radius:4px;overflow:hidden}
    .bar-track i{display:block;height:100%}
    table{width:100%;border-collapse:collapse;background:white}
    th,td{padding:9px;border:1px solid #e2e8f0;text-align:left}
    th{background:#f1f5f9}
    @media(max-width:700px){
      body{padding:16px}
      .grid{grid-template-columns:repeat(2,1fr)}
      .bar-row{grid-template-columns:100px 1fr 60px}
    }
  </style>
</head>
<body>
<main>
  <section class="hero">
    <h1>Flickr Inspector Report</h1>
    <p>${escapeHtml(text.createdAt)}: ${escapeHtml(createdAt)}</p>
    <p>${escapeHtml(text.timeBasis)}: ${escapeHtml(selectedTimeBasis)}</p>
    <p>${escapeHtml(text.timeZone)}: ${escapeHtml(props.timeZone)}</p>
  </section>

  <h2>${escapeHtml(text.overview)}</h2>
  <div class="grid">
    <div class="card">
      <span>${escapeHtml(text.files)}</span>
      <strong>${props.files.length.toLocaleString()}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.totalPosts)}</span>
      <strong>${props.summary.totalRecords.toLocaleString()}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.uniquePosts)}</span>
      <strong>${escapeHtml(metric(
        props.summary.uniquePostCount.toLocaleString(),
        available('id'),
        text,
      ))}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.uniqueOwners)}</span>
      <strong>${escapeHtml(uniqueOwnerValue)}</strong>
      ${ownerFieldNote}
    </div>
    <div class="card">
      <span>${escapeHtml(text.withLocation)}</span>
      <strong>${escapeHtml(metric(
        `${props.summary.locationCount.toLocaleString()} (${percentage(props.summary.locationCount)})`,
        available('geo'),
        text,
      ))}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.withTags)}</span>
      <strong>${escapeHtml(metric(
        `${props.summary.taggedPostCount.toLocaleString()} (${percentage(props.summary.taggedPostCount)})`,
        available('tags'),
        text,
      ))}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.duplicatePosts)}</span>
      <strong>${escapeHtml(metric(
        props.summary.duplicateCount.toLocaleString(),
        available('id'),
        text,
      ))}</strong>
    </div>
    <div class="card">
      <span>${escapeHtml(text.invalidLines)}</span>
      <strong>${props.summary.invalidLineCount.toLocaleString()}</strong>
    </div>
  </div>

  <p class="meta">
    ${escapeHtml(text.dateRange)}: ${escapeHtml(dateRange)}
  </p>

  <h2>${escapeHtml(text.monthlyPosts)}</h2>
  ${dateAvailable
    ? bars(monthly, '#2563eb')
    : `<p>${escapeHtml(text.dateUnavailable)}</p>`}

  <h2>${escapeHtml(text.frequentTags)}</h2>
  ${available('tags')
    ? bars(tags, '#0891b2')
    : `<p>${escapeHtml(text.tagsUnavailable)}</p>`}

  <h2>${escapeHtml(text.fileCounts)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(text.file)}</th>
        <th>${escapeHtml(text.size)}</th>
        <th>${escapeHtml(text.posts)}</th>
        <th>${escapeHtml(text.invalidLines)}</th>
        <th>${escapeHtml(text.duplicatePosts)}</th>
      </tr>
    </thead>
    <tbody>
      ${fileRows.map(file => `
        <tr>
          <td>${escapeHtml(file.name)}</td>
          <td>${file.size.toLocaleString()} bytes</td>
          <td>${file.recordCount.toLocaleString()}</td>
          <td>${file.invalidLineCount.toLocaleString()}</td>
          <td>${file.duplicateCount.toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <p class="meta">${escapeHtml(text.noMap)}</p>
</main>
</body>
</html>`

  const blob = new Blob(
    [html],
    { type: 'text/html;charset=utf-8' },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `flickr-inspector-report-${reportLocale}-${new Date().toISOString().slice(0, 10)}.html`
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <button
    type="button"
    class="export-button"
    @click="exportReport"
  >
    {{ t('saveReport') }}
  </button>
</template>

<style scoped>
.export-button {
  min-height: 38px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: #0f766e;
  font-weight: 700;
  cursor: pointer;
}

.export-button:hover {
  background: #115e59;
}
</style>
