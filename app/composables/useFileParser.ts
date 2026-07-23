export type FileReadResult = {
  id: string
  name: string
  size: number
  format: 'JSON Lines' | '不明'
  recordCount: number
  invalidLineCount: number
  duplicateCount: number
  status: '待機中' | '読込中' | '完了' | 'エラー'
  errorMessage?: string
}

export type TagCount = {
  tag: string
  count: number
}

export type LocationBin = {
  latitude: number
  longitude: number
  count: number
}

export type TimeBasis = 'upload' | 'taken'

export type OptionalFieldAvailability = {
  id: boolean
  owner: boolean
  owner_name: boolean
  date_upload: boolean
  date_taken: boolean
  geo: boolean
  tags: boolean
}

export type DataSummary = {
  totalRecords: number
  uniquePostCount: number
  uniqueOwnerCount: number
  ownerKeyUsed: 'owner' | 'owner_name' | null
  duplicateCount: number
  invalidLineCount: number
  invalidUploadDateCount: number
  locationCount: number
  taggedPostCount: number
  earliestUploadDate: Date | null
  latestUploadDate: Date | null
  monthlyPostCounts: Record<string, number>
  yearlyPostCounts: Record<string, number>
  weekdayHourCounts: number[][]
  selectedDateRecordCount: number
  earliestDateLabel: string | null
  latestDateLabel: string | null
  topTags: TagCount[]
  locationBins: LocationBin[]
  locationBinCount: number
  displayedLocationCount: number
  availableFields: OptionalFieldAvailability
}

type FlickrRecord = {
  id?: unknown
  owner?: unknown
  owner_name?: unknown
  date_upload?: unknown
  date_taken?: unknown
  lat?: unknown
  lon?: unknown
  tags?: unknown
}

type AggregationState = {
  photoIds: Set<string>
  ownerIds: Set<string>
  ownerNames: Set<string>
  uploadTimestamps: number[]
  takenDates: Array<{ year: string, month: string, day: string, hour: number, weekday: number, label: string }>
  tagCounts: Map<string, number>
  locationCounts: Map<string, { latitude: number, longitude: number, count: number }>
  seenKeys: Set<string>
  summary: DataSummary
}

type FileAggregationResult = {
  recordCount: number
  invalidLineCount: number
  duplicateCount: number
}

function createSummary(): DataSummary {
  return {
    totalRecords: 0,
    uniquePostCount: 0,
    uniqueOwnerCount: 0,
    ownerKeyUsed: null,
    duplicateCount: 0,
    invalidLineCount: 0,
    invalidUploadDateCount: 0,
    locationCount: 0,
    taggedPostCount: 0,
    earliestUploadDate: null,
    latestUploadDate: null,
    monthlyPostCounts: {},
    yearlyPostCounts: {},
    weekdayHourCounts: Array.from({ length: 7 }, () => Array(24).fill(0)),
    selectedDateRecordCount: 0,
    earliestDateLabel: null,
    latestDateLabel: null,
    topTags: [],
    locationBins: [],
    locationBinCount: 0,
    displayedLocationCount: 0,
    availableFields: { id: false, owner: false, owner_name: false, date_upload: false, date_taken: false, geo: false, tags: false },
  }
}

function createAggregationState(): AggregationState {
  return {
    photoIds: new Set<string>(),
    ownerIds: new Set<string>(),
    ownerNames: new Set<string>(),
    uploadTimestamps: [],
    takenDates: [],
    tagCounts: new Map<string, number>(),
    locationCounts: new Map(),
    seenKeys: new Set<string>(),
    summary: createSummary(),
  }
}

function getNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const text = String(value).trim()
  return text === '' ? null : text
}

function isFlickrRecord(value: unknown): value is FlickrRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function addLocation(record: FlickrRecord, state: AggregationState): void {
  const latitudeText = getNonEmptyString(record.lat)
  const longitudeText = getNonEmptyString(record.lon)
  if (latitudeText === null || longitudeText === null) return

  const latitude = Number(latitudeText)
  const longitude = Number(longitudeText)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return

  state.summary.locationCount += 1

  // 約30m単位で保持し、表示時に選択したセルサイズへまとめ直します。
  const gridSize = 0.0003
  const gridLatitude = Math.round(latitude / gridSize) * gridSize
  const gridLongitude = Math.round(longitude / gridSize) * gridSize
  const key = `${gridLatitude.toFixed(5)},${gridLongitude.toFixed(5)}`
  const current = state.locationCounts.get(key)

  if (current) current.count += 1
  else state.locationCounts.set(key, {
    latitude: gridLatitude,
    longitude: gridLongitude,
    count: 1,
  })
}

function getUploadTimestamp(value: unknown): number | null {
  const text = getNonEmptyString(value)
  if (text === null) return null
  const seconds = Number(text)
  if (!Number.isFinite(seconds)) return null
  const milliseconds = seconds * 1000
  return Number.isNaN(new Date(milliseconds).getTime()) ? null : milliseconds
}

function getTakenDate(value: unknown): { year: string, month: string, day: string, hour: number, weekday: number, label: string } | null {
  const raw = getNonEmptyString(value)
  if (raw === null) return null
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):\d{2}:\d{2})?/)
  if (!match) return null
  const [, year, month, day, hourText = '00'] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hourText)))
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day) || Number(hourText) > 23) return null
  return { year, month, day, hour: Number(hourText), weekday: date.getUTCDay(), label: `${year}-${month}-${day}` }
}

function addTags(value: unknown, state: AggregationState): void {
  const text = getNonEmptyString(value)
  if (text === null) return

  state.summary.taggedPostCount += 1

  // 同じ投稿内に同じタグが複数あっても、1回として数えます。
  const tags = new Set(
    text
      .split(/\s+/u)
      .map(tag => tag.trim().toLocaleLowerCase())
      .filter(tag => tag !== ''),
  )

  for (const tag of tags) {
    state.tagCounts.set(tag, (state.tagCounts.get(tag) ?? 0) + 1)
  }
}

function aggregateRecord(record: FlickrRecord, state: AggregationState): boolean {
  const summary = state.summary
  for (const key of Object.keys(record)) state.seenKeys.add(key)
  summary.totalRecords += 1

  let isDuplicate = false
  const photoId = getNonEmptyString(record.id)
  if (photoId !== null) {
    if (state.photoIds.has(photoId)) {
      summary.duplicateCount += 1
      isDuplicate = true
    } else {
      state.photoIds.add(photoId)
    }
  }

  const ownerId = getNonEmptyString(record.owner)
  const ownerName = getNonEmptyString(record.owner_name)
  if (ownerId !== null) state.ownerIds.add(ownerId)
  if (ownerName !== null) state.ownerNames.add(ownerName)
  addLocation(record, state)
  addTags(record.tags, state)

  const uploadTimestamp = getUploadTimestamp(record.date_upload)
  if (uploadTimestamp === null) summary.invalidUploadDateCount += 1
  else state.uploadTimestamps.push(uploadTimestamp)

  const takenDate = getTakenDate(record.date_taken)
  if (takenDate !== null) state.takenDates.push(takenDate)

  summary.uniquePostCount = state.photoIds.size
  return isDuplicate
}

function buildTimeSummary(state: AggregationState, timeZone: string, basis: TimeBasis): void {
  const monthlyPostCounts: Record<string, number> = {}
  const yearlyPostCounts: Record<string, number> = {}
  const weekdayHourCounts = Array.from({ length: 7 }, () => Array(24).fill(0))
  const labels: string[] = []

  if (basis === 'upload') {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' })
    const weekdayNumbers: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    for (const timestamp of state.uploadTimestamps) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map(part => [part.type, part.value]))
      if (!parts.year || !parts.month || !parts.day) continue
      yearlyPostCounts[parts.year] = (yearlyPostCounts[parts.year] ?? 0) + 1
      const monthKey = `${parts.year}-${parts.month}`
      monthlyPostCounts[monthKey] = (monthlyPostCounts[monthKey] ?? 0) + 1
      const weekday = weekdayNumbers[parts.weekday]
      const hour = Number(parts.hour)
      if (weekday !== undefined && hour >= 0 && hour < 24) weekdayHourCounts[weekday][hour] += 1
      labels.push(`${parts.year}-${parts.month}-${parts.day}`)
    }
    state.summary.selectedDateRecordCount = state.uploadTimestamps.length
    state.summary.invalidUploadDateCount = state.summary.totalRecords - state.uploadTimestamps.length
  } else {
    for (const item of state.takenDates) {
      yearlyPostCounts[item.year] = (yearlyPostCounts[item.year] ?? 0) + 1
      const monthKey = `${item.year}-${item.month}`
      monthlyPostCounts[monthKey] = (monthlyPostCounts[monthKey] ?? 0) + 1
      weekdayHourCounts[item.weekday][item.hour] += 1
      labels.push(item.label)
    }
    state.summary.selectedDateRecordCount = state.takenDates.length
    state.summary.invalidUploadDateCount = state.summary.totalRecords - state.takenDates.length
  }

  labels.sort()
  state.summary.monthlyPostCounts = monthlyPostCounts
  state.summary.yearlyPostCounts = yearlyPostCounts
  state.summary.weekdayHourCounts = weekdayHourCounts
  state.summary.earliestDateLabel = labels[0] ?? null
  state.summary.latestDateLabel = labels.at(-1) ?? null
}

function buildAvailabilitySummary(state: AggregationState): void {
  state.summary.availableFields = {
    id: state.seenKeys.has('id'),
    owner: state.seenKeys.has('owner'),
    owner_name: state.seenKeys.has('owner_name'),
    date_upload: state.seenKeys.has('date_upload'),
    date_taken: state.seenKeys.has('date_taken'),
    geo: state.seenKeys.has('lat') && state.seenKeys.has('lon'),
    tags: state.seenKeys.has('tags'),
  }
  if (state.seenKeys.has('owner')) {
    state.summary.ownerKeyUsed = 'owner'
    state.summary.uniqueOwnerCount = state.ownerIds.size
  } else if (state.seenKeys.has('owner_name')) {
    state.summary.ownerKeyUsed = 'owner_name'
    state.summary.uniqueOwnerCount = state.ownerNames.size
  } else {
    state.summary.ownerKeyUsed = null
    state.summary.uniqueOwnerCount = 0
  }
}

function buildLocationSummary(state: AggregationState): void {
  const allBins = Array.from(state.locationCounts.values())
    .sort((a, b) => b.count - a.count)

  state.summary.locationBins = allBins
  state.summary.locationBinCount = allBins.length
  state.summary.displayedLocationCount = state.summary.locationCount
}

function buildTagSummary(state: AggregationState): void {
  state.summary.topTags = Array.from(state.tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 50)
}

async function readJsonLines(file: File, state: AggregationState): Promise<FileAggregationResult> {
  const reader = file.stream().pipeThrough(new TextDecoderStream()).getReader()
  let recordCount = 0
  let invalidLineCount = 0
  let duplicateCount = 0
  let remainingText = ''

  function processLine(line: string): void {
    const trimmed = line.trim()
    if (trimmed === '') return
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (!isFlickrRecord(parsed)) {
        invalidLineCount += 1
        state.summary.invalidLineCount += 1
        return
      }
      if (aggregateRecord(parsed, state)) duplicateCount += 1
      recordCount += 1
    } catch {
      invalidLineCount += 1
      state.summary.invalidLineCount += 1
    }
  }

  while (true) {
    const result = await reader.read()
    if (result.done) break
    remainingText += result.value
    const lines = remainingText.split(/\r?\n/)
    remainingText = lines.pop() ?? ''
    for (const line of lines) processLine(line)
  }

  if (remainingText.trim() !== '') processLine(remainingText)
  return { recordCount, invalidLineCount, duplicateCount }
}

export function useFileParser() {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const timeZone = ref('Asia/Tokyo')
  const timeBasis = ref<TimeBasis>('upload')
  const summary = reactive<DataSummary>(createSummary())
  let state = createAggregationState()

  function updateVisibleSummary(): void {
    Object.assign(summary, state.summary)
  }

  function rebuildDerivedSummary(): void {
    buildTimeSummary(state, timeZone.value, timeBasis.value)
    buildTagSummary(state)
    buildLocationSummary(state)
    buildAvailabilitySummary(state)
    updateVisibleSummary()
  }

  function setTimeZone(value: string): void {
    timeZone.value = value
    rebuildDerivedSummary()
  }

  function setTimeBasis(value: TimeBasis): void {
    timeBasis.value = value
    rebuildDerivedSummary()
  }

  function resetSummary(): void {
    state = createAggregationState()
    Object.assign(summary, createSummary())
  }

  async function readFile(file: File, result: FileReadResult): Promise<void> {
    result.status = '読込中'
    result.errorMessage = undefined
    try {
      const name = file.name.toLowerCase()
      if (!name.endsWith('.jsonl') && !name.endsWith('.ndjson') && !name.endsWith('.jsonlines')) {
        throw new Error('JSON Linesファイルを選択してください。')
      }

      result.format = 'JSON Lines'
      const fileResult = await readJsonLines(file, state)
      result.recordCount = fileResult.recordCount
      result.invalidLineCount = fileResult.invalidLineCount
      result.duplicateCount = fileResult.duplicateCount
      result.status = '完了'
    } catch (error) {
      result.status = 'エラー'
      result.recordCount = 0
      result.invalidLineCount = 0
      result.duplicateCount = 0
      result.errorMessage = error instanceof Error ? error.message : 'ファイルを読み込めませんでした。'
    }
  }

  async function readFiles(files: File[], results: FileReadResult[]): Promise<void> {
    resetSummary()
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const result = results[index]
      if (file && result) await readFile(file, result)
    }
    if (timeBasis.value === 'upload' && !state.seenKeys.has('date_upload') && state.seenKeys.has('date_taken')) timeBasis.value = 'taken'
    if (timeBasis.value === 'taken' && !state.seenKeys.has('date_taken') && state.seenKeys.has('date_upload')) timeBasis.value = 'upload'
    rebuildDerivedSummary()
  }

  return {
    summary,
    timeZone,
    timeBasis,
    browserTimeZone,
    readFiles,
    resetSummary,
    setTimeZone,
    setTimeBasis,
  }
}
