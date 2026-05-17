<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../stores/useStore.js'

const { state, addJob, updateJob, removeJob, getJobStats } = useStore()

const showForm = ref(false)
const newJob = ref({ title: '', company: '', url: '', notes: '' })
const editingNote = ref(null)
const noteText = ref('')
const editingJob = ref(null)
const editData = ref({ title: '', company: '', url: '', notes: '' })
const filterStatus = ref('all')
const toast = ref('')

const statusConfig = {
  saved:    { label: '待投递', cls: 'tag',              icon: '📌' },
  applied:  { label: '已投递', cls: 'tag tag-accent',   icon: '📤' },
  interview:{ label: '面试中', cls: 'tag tag-warning',   icon: '🎙️' },
  offer:    { label: '已Offer', cls: 'tag tag-success', icon: '🎉' },
  rejected: { label: '已拒',   cls: 'tag tag-danger',   icon: '✕' },
}

const nextStatus = {
  saved: 'applied',
  applied: 'interview',
  interview: 'offer',
  offer: null,
  rejected: null,
}

const filteredJobs = computed(() => {
  return filterStatus.value === 'all'
    ? state.jobs
    : state.jobs.filter(j => j.status === filterStatus.value)
})

const stats = computed(() => getJobStats())

function handleSubmit() {
  if (!newJob.value.title && !newJob.value.url) return
  addJob({
    title: newJob.value.title || '未命名岗位',
    company: newJob.value.company || '',
    url: newJob.value.url || '',
    notes: newJob.value.notes || '',
  })
  newJob.value = { title: '', company: '', url: '', notes: '' }
  showForm.value = false
  showToast('已添加')
}

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

function startEdit(job) {
  editingJob.value = job.id
  editData.value = {
    title: job.title,
    company: job.company,
    url: job.url,
    notes: job.notes,
  }
}

function saveEdit(job) {
  updateJob(job.id, {
    title: editData.value.title || '未命名岗位',
    company: editData.value.company,
    url: editData.value.url,
    notes: editData.value.notes,
  })
  editingJob.value = null
}

function cancelEdit() {
  editingJob.value = null
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function openAllLinks() {
  const urls = state.jobs.filter(j => j.url).map(j => j.url)
  if (urls.length === 0) { showToast('没有可打开的链接'); return }
  urls.forEach(url => window.open(url, '_blank'))
  showToast(`已打开 ${urls.length} 个链接`)
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2000)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>📊 投递追踪</h1>
      <p class="page-desc">记录投递的网站链接和备注，每天逐一打开检查最新动态。</p>
    </div>

    <!-- 统计 + 快捷操作 -->
    <div class="card" v-if="state.jobs.length > 0">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;gap:20px;align-items:center;">
          <div style="text-align:center;">
            <div style="font-size:24px;font-weight:700;">{{ stats.total }}</div>
            <div style="font-size:11px;color:var(--text-muted);">全部</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--accent);">{{ stats.applied }}</div>
            <div style="font-size:11px;color:var(--text-muted);">已投递</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--warning);">{{ stats.interview }}</div>
            <div style="font-size:11px;color:var(--text-muted);">面试中</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--success);">{{ stats.offer }}</div>
            <div style="font-size:11px;color:var(--text-muted);">Offer</div>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" @click="openAllLinks">
            🔗 一键打开所有链接
          </button>
          <button class="btn btn-sm" @click="showForm = !showForm">
            {{ showForm ? '取消' : '+ 添加投递' }}
          </button>
        </div>
      </div>
      <!-- 转化漏斗 -->
      <div v-if="stats.total > 0" style="margin-top:12px;">
        <div style="display:flex;gap:4px;">
          <div v-for="(s, key) in statusConfig" :key="key"
            :style="{
              flex: (stats[key] || 0.5),
              background: key === 'saved' ? 'var(--bg-hover)' :
                          key === 'applied' ? 'var(--accent)' :
                          key === 'interview' ? 'var(--warning)' :
                          key === 'offer' ? 'var(--success)' : 'var(--danger)',
              height: '6px', borderRadius: '3px',
              opacity: stats[key] ? 1 : 0.3,
            }"
            :title="s.label + ': ' + (stats[key] || 0)"
          ></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
          <span>投递率 {{ stats.total ? Math.round(stats.applied / stats.total * 100) : 0 }}%</span>
          <span>面试率 {{ stats.applied ? Math.round(stats.interview / Math.max(stats.applied, 1) * 100) : 0 }}%</span>
          <span>Offer率 {{ stats.interview ? Math.round(stats.offer / Math.max(stats.interview, 1) * 100) : 0 }}%</span>
        </div>
      </div>
    </div>

    <!-- 添加表单 -->
    <div v-if="showForm" class="card" style="border-color: var(--accent);">
      <h3>新增投递</h3>
      <div class="grid-2">
        <div class="form-group">
          <label class="label">公司名称</label>
          <input class="input" v-model="newJob.company" placeholder="如：字节跳动" @keyup.enter="handleSubmit" />
        </div>
        <div class="form-group">
          <label class="label">岗位名称</label>
          <input class="input" v-model="newJob.title" placeholder="如：AI产品经理实习生" @keyup.enter="handleSubmit" />
        </div>
      </div>
      <div class="form-group">
        <label class="label">投递链接 🔗</label>
        <input class="input" v-model="newJob.url" placeholder="招聘页面URL，如：https://zhaopin.bytedance.com/..." @keyup.enter="handleSubmit" />
      </div>
      <div class="form-group">
        <label class="label">备注</label>
        <textarea class="textarea" v-model="newJob.notes" placeholder="投递截止日期、内推人、JD要点等..." rows="2"></textarea>
      </div>
      <button class="btn btn-primary" @click="handleSubmit">保存</button>
    </div>

    <!-- 筛选 -->
    <div class="card" v-if="state.jobs.length > 0">
      <div class="btn-group">
        <button :class="['btn btn-sm', { 'btn-primary': filterStatus === 'all' }]" @click="filterStatus = 'all'">
          全部 ({{ stats.total }})
        </button>
        <button v-for="(s, key) in statusConfig" :key="key"
          :class="['btn btn-sm', { 'btn-primary': filterStatus === key }]" @click="filterStatus = key">
          {{ s.icon }} {{ s.label }} ({{ stats[key] || 0 }})
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="state.jobs.length === 0 && !showForm" class="card">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">开始追踪你的求职进度</div>
        <div class="empty-desc" style="margin-bottom:16px;">添加招聘网站链接和备注，每天回来逐一打开检查</div>
        <button class="btn btn-primary" @click="showForm = true">+ 添加第一条投递</button>
      </div>
    </div>

    <!-- 岗位列表 -->
    <div v-for="job in filteredJobs" :key="job.id" class="card job-card">
      <!-- 编辑模式 -->
      <div v-if="editingJob === job.id">
        <h3 style="margin-bottom:12px;">✏️ 编辑投递</h3>
        <div class="grid-2">
          <div class="form-group">
            <label class="label">公司名称</label>
            <input class="input" v-model="editData.company" placeholder="公司名称" />
          </div>
          <div class="form-group">
            <label class="label">岗位名称</label>
            <input class="input" v-model="editData.title" placeholder="岗位名称" />
          </div>
        </div>
        <div class="form-group">
          <label class="label">投递链接</label>
          <input class="input" v-model="editData.url" placeholder="招聘页面URL" />
        </div>
        <div class="form-group">
          <label class="label">备注</label>
          <textarea class="textarea" v-model="editData.notes" placeholder="备注信息..." rows="2"></textarea>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" @click="saveEdit(job)">保存</button>
          <button class="btn btn-sm" @click="cancelEdit">取消</button>
        </div>
      </div>

      <!-- 查看模式 -->
      <div v-else style="display:flex;align-items:flex-start;gap:12px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;padding-top:2px;">
          <button v-for="(s, key) in statusConfig" :key="key"
            :style="{
              width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: job.status === key
                ? (key === 'saved' ? 'var(--text-muted)' :
                   key === 'applied' ? 'var(--accent)' :
                   key === 'interview' ? 'var(--warning)' :
                   key === 'offer' ? 'var(--success)' : 'var(--danger)')
                : 'var(--border)',
              opacity: job.status === key ? 1 : 0.4,
            }"
            :title="s.label"
            @click="setStatus(job, key)"
          ></button>
        </div>

        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
            <strong style="font-size:15px;">{{ job.title }}</strong>
            <span v-if="job.company" style="color:var(--text-muted);font-size:13px;">@ {{ job.company }}</span>
            <span :class="statusConfig[job.status].cls">{{ statusConfig[job.status].icon }} {{ statusConfig[job.status].label }}</span>
          </div>

          <div v-if="job.url" style="margin-bottom:6px;">
            <a :href="job.url" target="_blank" class="job-link" @click.stop>
              🔗 {{ job.url }}
            </a>
          </div>

          <div v-if="editingNote === job.id" style="margin-bottom:6px;">
            <textarea class="textarea" v-model="noteText" placeholder="添加备注..." rows="2" style="font-size:13px;"></textarea>
            <div class="btn-group" style="margin-top:4px;">
              <button class="btn btn-primary btn-xs" @click="saveNote(job)">保存</button>
              <button class="btn btn-xs" @click="editingNote = null">取消</button>
            </div>
          </div>
          <div v-else-if="job.notes" style="margin-bottom:6px;font-size:13px;color:var(--text-secondary);padding:6px 10px;background:var(--bg);border-radius:6px;">
            📝 {{ job.notes }}
          </div>

          <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);margin-top:6px;">
            <span>{{ formatDate(job.createdAt) }}</span>
            <span v-if="job.matchResult" class="tag tag-accent" style="font-size:11px;">已匹配</span>
            <span v-if="job.interviewPrep" class="tag tag-success" style="font-size:11px;">已备面</span>

            <div style="margin-left:auto;display:flex;gap:4px;">
              <button class="btn btn-xs" @click="startEdit(job)">编辑</button>
              <button v-if="!job.notes" class="btn btn-xs" @click="openNote(job)">备注</button>
              <button v-else class="btn btn-xs" @click="openNote(job)">编辑备注</button>
              <button v-if="nextStatus[job.status]" class="btn btn-primary btn-xs" @click="advanceStatus(job)">
                → {{ statusConfig[nextStatus[job.status]].label }}
              </button>
              <button class="btn btn-xs" style="color:var(--danger);" @click="removeJob(job.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>

<style scoped>
.job-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 12px;
  word-break: break-all;
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.job-link:hover { text-decoration: underline; }
.job-card:hover { border-color: var(--accent); transition: border-color 0.15s; }
</style>
