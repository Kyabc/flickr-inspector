<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
const { t } = useLanguage()
const config = useRuntimeConfig()
const sampleUrl = computed(() => `${config.app.baseURL}samples/flickr-sample.jsonl`)
const exampleLines = [
  '{"id":"sample-001","owner":"sample-user-1","owner_name":"Sample User 1","date_upload":"1704067200","date_taken":"2024-01-01 09:30:00","lat":"35.681236","lon":"139.767125","tags":"tokyo station winter"}',
  '{"id":"sample-002","owner":"sample-user-2","owner_name":"Sample User 2","date_upload":"1706745600","date_taken":"2024-02-01 18:15:00","lat":"35.658034","lon":"139.701636","tags":"tokyo shibuya night"}',
]
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" :aria-labelledby="'sample-format-title'">
      <div class="modal-header">
        <h2 id="sample-format-title">{{ t('sampleTitle') }}</h2>
        <button type="button" class="icon-button" :aria-label="t('close')" @click="emit('close')">×</button>
      </div>
      <p>{{ t('sampleIntro') }}</p>
      <pre><code>{{ exampleLines.join('\n') }}</code></pre>
      <div class="fields">
        <strong>{{ t('sampleFields') }}</strong>
        <code>id, owner, owner_name, date_upload, date_taken, lat, lon, tags</code>
      </div>
      <p class="note">{{ t('sampleSynthetic') }}</p>
      <div class="actions">
        <a class="download-button" :href="sampleUrl" download="flickr-sample.jsonl">{{ t('sampleDownload') }}</a>
        <button type="button" class="close-button" @click="emit('close')">{{ t('close') }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:20px;background:rgb(15 23 42 / 62%)}.modal{width:min(760px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:24px;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgb(15 23 42 / 35%)}.modal-header{display:flex;align-items:center;justify-content:space-between;gap:20px}.modal h2{margin:0;font-size:21px}.modal p{color:#475569;line-height:1.65}.icon-button{width:36px;height:36px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-size:24px;cursor:pointer}.modal pre{overflow:auto;padding:16px;border-radius:9px;color:#dbeafe;background:#0f172a;font-size:12px;line-height:1.65}.fields{display:grid;gap:7px;padding:14px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc}.fields code{overflow-wrap:anywhere}.note{font-size:13px}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.download-button,.close-button{padding:10px 14px;border-radius:8px;font-weight:700;text-decoration:none}.download-button{color:#fff;background:#2563eb}.close-button{border:1px solid #cbd5e1;color:#334155;background:#fff;cursor:pointer}@media(max-width:560px){.modal{padding:18px}.actions{align-items:stretch;flex-direction:column;text-align:center}}
</style>
