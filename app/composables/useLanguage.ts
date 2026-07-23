export type AppLocale = 'ja' | 'en'

const messages = {
  ja: {
    subtitle: 'クロールしたFlickrデータの件数や不足、重複、投稿傾向を確認します。',
    loadFiles: 'ファイルを読み込む', sampleLoad: 'サンプルを読み込む', sampleLoading: 'サンプル読込中...', sampleFormat: '形式を見る', sampleTitle: '対応するJSON Lines形式', sampleIntro: '1行につき1件のJSONオブジェクトを記述します。ファイル全体を配列で囲まず、行の間にカンマを入れません。', sampleFields: '主に認識する項目', sampleSynthetic: 'サンプル内の投稿ID、投稿者、日時、タグ、位置情報は、動作確認用に作成した架空のデータです。', sampleDownload: 'サンプルをダウンロード', close: '閉じる', sampleError: 'サンプルデータを読み込めませんでした。', loadDescription: 'JSON Linesファイルを複数選択できます。ファイルは外部へ送信せず、ブラウザ内で処理します。',
    chooseFiles: 'ファイルを選択', reading: '読み込み中...', results: '読み込み結果', processing: 'ファイルを順番に処理しています。', filesChecked: '{count}個のファイルを確認しました。',
    timeBasis: '時間の基準', uploadDate: '投稿日', takenDate: '撮影日', timezone: 'タイムゾーン', clear: '選択を解除', saveReport: 'HTMLレポートを保存',
    fileCount: 'ファイル数', totalPosts: '総投稿数', uniquePosts: 'ユニーク投稿数', uniqueOwners: 'ユニーク投稿者数', locationAvailable: '位置情報あり', tagsAvailable: 'タグあり', duplicates: '重複投稿', invalidLines: '不正な行',
    missing: '未取得', ownerField: '集計項目: {field}', ownerMissing: 'ownerとowner_nameがありません', idMissing: 'idがありません', geoMissing: 'latまたはlonがありません', tagsMissing: 'tagsがありません', duplicateHelp: '投稿IDの重複分', invalidHelp: 'JSONとして読めない行',
    period: '投稿期間', timezoneDisplay: '{zone}で表示', selectedDateMissing: '選択した日時を取得していません', attention: '確認が必要な項目', mapLoading: '地図を読み込んでいます...', fileDetails: 'ファイルごとの件数', omittedPoints: '上限により{count}地点を省略', omittedPosts: '省略地点に含まれる投稿 {count}件', invalidFileLines: '読み込めない行が{count}件あります。', duplicateFilePosts: '重複投稿が{count}件あります。', failedFiles: '読み込めなかったファイルが{count}件あります。', duplicateNotice: '投稿IDが重複しているデータが{count}件あります。', invalidDateNotice: '{basis}がない、または読めない投稿が{count}件あります。', unknown: '不明',
    noFiles: 'まだファイルが選択されていません。', supported: '.jsonl、.ndjson、.jsonlinesに対応しています。',
    posts: '{count}件', completed: '完了', waiting: '待機中', error: 'エラー', loading: '読込中', fileType: 'JSON Lines',
    timeline: '投稿数の推移', timelineHelp: '{basis}を基準に集計しています。', monthly: '月別', yearly: '年別', noDates: '表示できる日時がありません。',
    timeHeatmap: '曜日・時間帯ごとの投稿数', timeHeatmapHelp: '{basis}を基準に集計しています。セルへカーソルを合わせると件数を確認できます。', hoverPrompt: 'セルへカーソルを合わせるか、クリックしてください。',
    tagChart: '頻出タグ', tagHelp: '同じ投稿内の重複タグは1回として数えます。英字の大文字と小文字はまとめます。', displayCount: '表示件数', noTags: 'タグが入っている投稿はありません。',
    fileChart: 'ファイルごとの件数', fileChartHelp: '正常に読めた投稿、不正な行、重複投稿を比較します。', order: '表示順', nameOrder: 'ファイル名順', selectedOrder: '選択した順', descOrder: '投稿数の多い順', ascOrder: '投稿数の少ない順', validPosts: '正常に読めた投稿',
    locationMap: '投稿地点', mapHelp: '{count}件の位置情報を、選択したセルサイズでまとめています。', heatmap: 'ヒートマップ', points: '地点', showAll: '全体を表示', cellSize: 'セルサイズ', mapPointLimit: '地図に表示する地点数', settingRange: '設定範囲 100～500,000地点', aggregatedPoints: '集計地点 {count}か所', displayedPoints: '地図表示 {count}か所', displayedPosts: '表示中の投稿 {count}件',
    language: '言語', japanese: '日本語', english: 'English',
    sunday:'日', monday:'月', tuesday:'火', wednesday:'水', thursday:'木', friday:'金', saturday:'土',
  },
  en: {
    subtitle: 'Inspect counts, missing fields, duplicates, and posting patterns in crawled Flickr data.',
    loadFiles: 'Load files', sampleLoad: 'Load sample', sampleLoading: 'Loading sample...', sampleFormat: 'View format', sampleTitle: 'Supported JSON Lines format', sampleIntro: 'Write one JSON object per line. Do not wrap the file in an array or place commas between lines.', sampleFields: 'Main recognized fields', sampleSynthetic: 'The photo IDs, owners, dates, tags, and locations in the sample are synthetic and intended only for testing.', sampleDownload: 'Download sample', close: 'Close', sampleError: 'The sample data could not be loaded.', loadDescription: 'Select multiple JSON Lines files. Files are processed locally in your browser and are not uploaded.',
    chooseFiles: 'Choose files', reading: 'Reading...', results: 'Inspection results', processing: 'Processing files in order.', filesChecked: 'Checked {count} files.',
    timeBasis: 'Time basis', uploadDate: 'Upload date', takenDate: 'Date taken', timezone: 'Time zone', clear: 'Clear files', saveReport: 'Save HTML report',
    fileCount: 'Files', totalPosts: 'Total posts', uniquePosts: 'Unique posts', uniqueOwners: 'Unique owners', locationAvailable: 'With location', tagsAvailable: 'With tags', duplicates: 'Duplicate posts', invalidLines: 'Invalid lines',
    missing: 'Not retrieved', ownerField: 'Counted by: {field}', ownerMissing: 'Neither owner nor owner_name is present', idMissing: 'id is not present', geoMissing: 'lat or lon is not present', tagsMissing: 'tags is not present', duplicateHelp: 'Duplicate photo IDs', invalidHelp: 'Lines that are not valid JSON',
    period: 'Date range', timezoneDisplay: 'Displayed in {zone}', selectedDateMissing: 'The selected date field was not retrieved', attention: 'Items to review', mapLoading: 'Loading map...', fileDetails: 'File details', omittedPoints: '{count} points omitted due to the limit', omittedPosts: '{count} posts are contained in omitted points', invalidFileLines: '{count} lines could not be read.', duplicateFilePosts: '{count} duplicate posts were found.', failedFiles: '{count} files could not be read.', duplicateNotice: '{count} posts have duplicate photo IDs.', invalidDateNotice: '{count} posts have a missing or invalid {basis}.', unknown: 'Unknown',
    noFiles: 'No files selected yet.', supported: 'Supports .jsonl, .ndjson, and .jsonlines.',
    posts: '{count} posts', completed: 'Complete', waiting: 'Waiting', error: 'Error', loading: 'Reading', fileType: 'JSON Lines',
    timeline: 'Post count over time', timelineHelp: 'Aggregated by {basis}.', monthly: 'Monthly', yearly: 'Yearly', noDates: 'No usable dates to display.',
    timeHeatmap: 'Posts by weekday and hour', timeHeatmapHelp: 'Aggregated by {basis}. Hover over or select a cell to see the count.', hoverPrompt: 'Hover over or select a cell.',
    tagChart: 'Frequent tags', tagHelp: 'A repeated tag within one post is counted once. Latin letters are case-insensitive.', displayCount: 'Show', noTags: 'No posts contain tags.',
    fileChart: 'Counts by file', fileChartHelp: 'Compare valid posts, invalid lines, and duplicate posts.', order: 'Order', nameOrder: 'File name', selectedOrder: 'Selection order', descOrder: 'Most posts', ascOrder: 'Fewest posts', validPosts: 'Valid posts',
    locationMap: 'Post locations', mapHelp: '{count} geotagged posts are grouped using the selected cell size.', heatmap: 'Heatmap', points: 'Points', showAll: 'Fit all', cellSize: 'Cell size', mapPointLimit: 'Maximum map points', settingRange: 'Range: 100 to 500,000 points', aggregatedPoints: '{count} aggregated points', displayedPoints: '{count} displayed points', displayedPosts: '{count} displayed posts',
    language: 'Language', japanese: '日本語', english: 'English',
    sunday:'Sun', monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat',
  },
} as const

export function useLanguage() {
  const locale = useState<AppLocale>('app-locale', () => 'ja')
  function setLocale(value: AppLocale) { locale.value = value }
  function t(key: keyof typeof messages.ja, values: Record<string, string | number> = {}): string {
    let text: string = messages[locale.value][key]
    for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value))
    return text
  }
  return { locale, setLocale, t }
}
