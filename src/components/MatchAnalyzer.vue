<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../stores/useStore.js'
import { MATCH_ANALYSIS_PROMPT } from '../prompts/templates.js'

const { state, getResumeText, updateJob } = useStore()

const selectedJobId = ref(null)
const matchResult = ref('')
const toast = ref('')

const selectedJob = computed(() => state.jobs.find(j => j.id === selectedJobId.value))
const resumeText = computed(() => getResumeText())
const hasResume = computed(() => resumeText.value.length > 20)

function getPrompt() {
  if (!selectedJob.value) return ''
  return MATCH_ANALYSIS_PROMPT
    .replace('{resume_text}', resumeText.value || '（请先在"我的简历"中完善个人信息）')
    .replace('{jd_text}', selectedJob.value.rawJD)
}

async function copyPrompt() {
  if (!selectedJob.value) return
  const prompt = getPrompt()
  await navigator.clipboard.writeText(prompt)
  showToast('匹配分析Prompt已复制，打开AI工具粘贴即可')
}

function saveResult() {
  if (!selectedJob.value || !matchResult.value) return
  updateJob(selectedJob.value.id, { matchResult: matchResult.value })
  showToast('匹配结果已保存')
}

function pasteResult() {
  navigator.clipboard.readText().then(text => {
    if (text) {
      matchResult.value = text
      showToast('AI分析结果已粘贴')
    }
  }).catch(() => showToast('请手动粘贴'))
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2500)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>🎯 人岗匹配</h1>
      <p class="page-desc">对比你的简历和目标JD，生成专业匹配度分析Prompt。发现优势与差距，针对性准备。</p>
    </div>

    <!-- 简历状态检查 -->
    <div v-if="!hasResume" class="card" style="background:var(--warning-bg);border-color:var(--warning);">
      <p style="font-size:14px;">
        ⚠️ 请先在<a href="#" @click.prevent style="color:var(--accent);text-decoration:underline;">「我的简历」</a>中完善你的个人信息，以获得更精准的匹配分析。
      </p>
    </div>

    <!-- 选择JD -->
    <div class="card">
      <h3>选择目标岗位</h3>
      <div v-if="state.jobs.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无JD</div>
        <div class="empty-desc">请先在「JD解析」中保存职位信息</div>
      </div>

      <div v-else class="form-group">
        <select class="select" v-model="selectedJobId">
          <option :value="null" disabled>请选择岗位...</option>
          <option v-for="job in state.jobs" :key="job.id" :value="job.id">
            {{ job.company }} — {{ job.title }}
          </option>
        </select>
      </div>

      <!-- 选中的JD预览 -->
      <div v-if="selectedJob" class="result-block" style="max-height:200px;">
        <strong>{{ selectedJob.company }} — {{ selectedJob.title }}</strong>
        <br><br>
        {{ selectedJob.rawJD.slice(0, 500) }}{{ selectedJob.rawJD.length > 500 ? '...' : '' }}
      </div>
    </div>

    <!-- 简历预览 -->
    <div v-if="hasResume && selectedJob" class="card">
      <h3>你的简历摘要</h3>
      <div class="result-block" style="max-height:200px;">{{ resumeText }}</div>
    </div>

    <!-- 生成Prompt -->
    <div v-if="selectedJob" class="card">
      <div class="btn-group">
        <button class="btn btn-primary" :disabled="!hasResume" @click="copyPrompt">
          📋 复制匹配分析Prompt
        </button>
      </div>
      <div v-if="getPrompt()" class="result-block" style="font-family: monospace; font-size: 13px; margin-top:8px;">
        {{ getPrompt() }}
      </div>
    </div>

    <!-- AI结果 -->
    <div v-if="selectedJob" class="card">
      <h3>AI匹配分析结果</h3>
      <textarea
        class="textarea"
        v-model="matchResult"
        :placeholder="selectedJob.matchResult || '把AI的匹配分析结果粘贴到这里...'"
        rows="8"
      ></textarea>
      <div class="btn-group" style="margin-top:8px;">
        <button class="btn btn-sm" @click="pasteResult">📥 从剪贴板粘贴</button>
        <button v-if="matchResult" class="btn btn-primary btn-sm" @click="saveResult">💾 保存结果</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>
