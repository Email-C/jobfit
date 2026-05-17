<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../stores/useStore.js'

const { state, updateJob, removeJob, getJobStats } = useStore()

const filterStatus = ref('all')
const editingNote = ref(null)
const noteText = ref('')

const statusLabels = {
  saved: { label: '待投递', class: 'tag' },
  applied: { label: '已投递', class: 'tag tag-accent' },
  interview: { label: '面试中', class: 'tag tag-warning' },
  offer: { label: '已Offer', class: 'tag tag-success' },
  rejected: { label: '已拒', class: 'tag tag-danger' },
}

const nextStatus = {
  saved: 'applied',
  applied: 'interview',
  interview: 'offer',
  offer: null,
  rejected: null,
}

const filteredJobs = computed(() => {
  if (filterStatus.value === 'all') return state.jobs
  return state.jobs.filter(j => j.status === filterStatus.value)
})

const stats = computed(() => getJobStats())

function advanceStatus(job) {
  const next = nextStatus[job.status]
  if (next) updateJob(job.id, { status: next })
}

function setStatus(job, status) {
  updateJob(job.id, { status })
}

function openNote(job) {
  editingNote.value = job.id
  noteText.value = job.notes || ''
}

function saveNote(job) {
  updateJob(job.id, { notes: noteText.value })
  editingNote.value = null
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>📊 投递追踪</h1>
      <p class="page-desc">管理你的求职进度，从JD保存到Offer全流程跟踪。</p>
    </div>

    <!-- 统计卡片 -->
    <div v-if="stats.total > 0" class="card">
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div style="flex:1;min-width:80px;text-align:center;">
          <div style="font-size:28px;font-weight:700;">{{ stats.total }}</div>
          <div style="font-size:12px;color:var(--text-muted);">总计</div>
        </div>
        <div style="flex:1;min-width:80px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:var(--accent);">{{ stats.applied }}</div>
          <div style="font-size:12px;color:var(--text-muted);">已投递</div>
        </div>
        <div style="flex:1;min-width:80px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:var(--warning);">{{ stats.interview }}</div>
          <div style="font-size:12px;color:var(--text-muted);">面试中</div>
        </div>
        <div style="flex:1;min-width:80px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:var(--success);">{{ stats.offer }}</div>
          <div style="font-size:12px;color:var(--text-muted);">Offer</div>
        </div>
      </div>
      <!-- 漏斗 -->
      <div v-if="stats.total > 0" style="margin-top: 16px;">
        <div class="progress-bar" style="height:8px;">
          <div class="progress-fill" :style="{ width: stats.total ? (stats.applied / stats.total * 100) + '%' : '0%', background: 'var(--accent)' }"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
          <span>投递率 {{ stats.total ? Math.round(stats.applied / stats.total * 100) : 0 }}%</span>
          <span>面试率 {{ stats.applied ? Math.round(stats.interview / stats.applied * 100) : 0 }}%</span>
          <span>Offer率 {{ stats.interview ? Math.round(stats.offer / stats.interview * 100) : 0 }}%</span>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="card">
      <div class="btn-group">
        <button
          :class="['btn btn-sm', { 'btn-primary': filterStatus === 'all' }]"
          @click="filterStatus = 'all'"
        >全部 ({{ stats.total }})</button>
        <button
          v-for="(s, key) in statusLabels"
          :key="key"
          :class="['btn btn-sm', { 'btn-primary': filterStatus === key }]"
          @click="filterStatus = key"
        >{{ s.label }} ({{ stats[key] || 0 }})</button>
      </div>
    </div>

    <!-- 岗位列表 -->
    <div v-if="state.jobs.length === 0" class="card">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">还没有保存任何岗位</div>
        <div class="empty-desc">去「JD解析」添加你的第一个目标岗位吧</div>
      </div>
    </div>

    <div v-for="job in filteredJobs" :key="job.id" class="card">
      <div class="card-header">
        <div>
          <strong style="font-size:15px;">{{ job.title }}</strong>
          <span style="color:var(--text-muted);margin-left:8px;font-size:13px;">{{ job.company }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span :class="statusLabels[job.status].class">{{ statusLabels[job.status].label }}</span>
          <span style="font-size:12px;color:var(--text-muted);">{{ formatDate(job.createdAt) }}</span>
        </div>
      </div>

      <!-- JD预览 -->
      <div class="result-block" style="max-height:120px;font-size:13px;margin-bottom:12px;">
        {{ job.rawJD.slice(0, 300) }}{{ job.rawJD.length > 300 ? '...' : '' }}
      </div>

      <!-- 备注 -->
      <div v-if="editingNote === job.id" style="margin-bottom:12px;">
        <textarea class="textarea" v-model="noteText" placeholder="添加备注..." rows="2"></textarea>
        <div class="btn-group" style="margin-top:6px;">
          <button class="btn btn-primary btn-xs" @click="saveNote(job)">保存</button>
          <button class="btn btn-xs" @click="editingNote = null">取消</button>
        </div>
      </div>
      <div v-else-if="job.notes" style="margin-bottom:12px;font-size:13px;color:var(--text-secondary);padding:8px;background:var(--bg);border-radius:6px;">
        📝 {{ job.notes }}
      </div>

      <!-- 操作 -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <!-- 状态推进 -->
        <button
          v-if="nextStatus[job.status]"
          class="btn btn-primary btn-xs"
          @click="advanceStatus(job)"
        >
          → {{ statusLabels[nextStatus[job.status]].label }}
        </button>

        <!-- 状态切换 -->
        <select
          class="select"
          style="width:auto;padding:4px 8px;font-size:11px;"
          :value="job.status"
          @change="setStatus(job, ($event.target).value)"
        >
          <option v-for="(s, key) in statusLabels" :key="key" :value="key">{{ s.label }}</option>
        </select>

        <button class="btn btn-xs" @click="openNote(job)">备注</button>

        <!-- 匹配结果标记 -->
        <span v-if="job.matchResult" class="tag tag-accent">已匹配</span>
        <span v-if="job.interviewPrep" class="tag tag-success">已备面</span>

        <button class="btn btn-xs" style="margin-left:auto;color:var(--danger);" @click="removeJob(job.id)">删除</button>
      </div>
    </div>
  </div>
</template>
