<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../stores/useStore.js'
import { INTERVIEW_PREP_PROMPT } from '../prompts/templates.js'

const { state, getResumeText, updateJob } = useStore()

const selectedJobId = ref(null)
const interviewResult = ref('')
const toast = ref('')

const selectedJob = computed(() => state.jobs.find(j => j.id === selectedJobId.value))
const resumeText = computed(() => getResumeText())

function getPrompt() {
  if (!selectedJob.value) return ''
  return INTERVIEW_PREP_PROMPT
    .replace('{jd_text}', selectedJob.value.rawJD)
    .replace('{resume_text}', resumeText.value || '（未填写简历信息）')
}

async function copyPrompt() {
  if (!selectedJob.value) return
  await navigator.clipboard.writeText(getPrompt())
  showToast('面试准备Prompt已复制!')
}

function saveResult() {
  if (!selectedJob.value || !interviewResult.value) return
  updateJob(selectedJob.value.id, { interviewPrep: interviewResult.value })
  showToast('面试准备方案已保存')
}

function pasteResult() {
  navigator.clipboard.readText().then(text => {
    if (text) {
      interviewResult.value = text
      showToast('已粘贴')
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
      <h1>💡 面试准备</h1>
      <p class="page-desc">基于JD和你的简历，生成一套完整的面试准备方案。包含行为面、技术面、情景题和反问建议。</p>
    </div>

    <!-- 选择JD -->
    <div class="card">
      <h3>选择面试岗位</h3>
      <div v-if="state.jobs.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无保存的岗位</div>
        <div class="empty-desc">请先在「JD解析」中解析并保存职位</div>
      </div>
      <div v-else class="form-group">
        <select class="select" v-model="selectedJobId">
          <option :value="null" disabled>请选择岗位...</option>
          <option v-for="job in state.jobs" :key="job.id" :value="job.id">
            {{ job.company }} — {{ job.title }} {{ job.interviewPrep ? '✅' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- 生成 -->
    <div v-if="selectedJob" class="card">
      <div class="btn-group">
        <button class="btn btn-primary" @click="copyPrompt">
          📋 复制面试准备Prompt
        </button>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">
        Prompt将生成：行为面试题 + 技术/业务题 + 情景模拟题 + 反问建议 + 考前Checklist
      </p>
      <div class="result-block" style="font-family: monospace; font-size: 13px; margin-top:8px;">
        {{ getPrompt() }}
      </div>
    </div>

    <!-- AI结果 -->
    <div v-if="selectedJob" class="card">
      <h3>AI面试准备方案</h3>
      <div v-if="selectedJob.interviewPrep" class="result-block" style="margin-bottom:12px;">
        {{ selectedJob.interviewPrep }}
      </div>
      <textarea
        class="textarea"
        v-model="interviewResult"
        :placeholder="selectedJob.interviewPrep ? '可覆盖更新...' : '把AI生成的面试准备方案粘贴到这里...'"
        rows="10"
      ></textarea>
      <div class="btn-group" style="margin-top:8px;">
        <button class="btn btn-sm" @click="pasteResult">📥 从剪贴板粘贴</button>
        <button v-if="interviewResult" class="btn btn-primary btn-sm" @click="saveResult">💾 保存方案</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>
