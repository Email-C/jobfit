<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../stores/useStore.js'
import { RESUME_PARSE_PROMPT, RESUME_IMAGE_PARSE_PROMPT } from '../prompts/templates.js'
import mammoth from 'mammoth'

const { state } = useStore()
const r = state.resume

const newSkill = ref({ name: '', level: '熟练', category: 'AI/LLM' })
const newExp = ref({ company: '', role: '', duration: '', highlights: '' })
const newProj = ref({ name: '', description: '', highlights: '' })
const toast = ref('')

const skillCategories = ['AI/LLM', '数据分析', '产品设计', '编程语言', '外语', '其他']
const levels = ['精通', '熟练', '了解']

// 文件上传状态
const isDragging = ref(false)
const isProcessing = ref(false)
const extractedText = ref('')
const fileName = ref('')
const fileType = ref('')
const parseResult = ref('')
const showUploadArea = ref(true)

// Prompt生成
const currentPrompt = computed(() => {
  if (!extractedText.value) return ''
  if (fileType.value === 'image') {
    return RESUME_IMAGE_PARSE_PROMPT
  }
  return RESUME_PARSE_PROMPT.replace('{raw_text}', extractedText.value)
})

async function handleFile(file) {
  if (!file) return
  fileName.value = file.name
  fileType.value = ''
  isProcessing.value = true
  extractedText.value = ''
  parseResult.value = ''

  const ext = file.name.split('.').pop().toLowerCase()

  try {
    if (ext === 'pdf') {
      fileType.value = 'pdf'
      await extractPDF(file)
    } else if (ext === 'docx' || ext === 'doc') {
      fileType.value = 'docx'
      await extractDocx(file)
    } else if (ext === 'txt') {
      fileType.value = 'text'
      extractedText.value = await file.text()
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
      fileType.value = 'image'
      // 图片：用base64预览
      const reader = new FileReader()
      reader.onload = (e) => {
        extractedText.value = e.target.result
        isProcessing.value = false
      }
      reader.readAsDataURL(file)
      return
    } else {
      showToast('不支持的文件格式，请上传 PDF / Word / 图片 / TXT')
      isProcessing.value = false
      return
    }
    isProcessing.value = false
  } catch (err) {
    showToast('文件解析失败：' + err.message)
    isProcessing.value = false
  }
}

async function extractPDF(file) {
  // 动态加载 pdf.js CDN
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }
  if (!fullText.trim()) throw new Error('PDF中未检测到文字，可能是扫描件，请用图片格式上传')
  extractedText.value = fullText.trim()
}

async function extractDocx(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  if (!result.value.trim()) throw new Error('文档中未检测到文字')
  extractedText.value = result.value.trim()
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  handleFile(file)
}

function onFileInput(e) {
  const file = e.target.files[0]
  handleFile(file)
}

function resetUpload() {
  extractedText.value = ''
  parseResult.value = ''
  fileName.value = ''
  fileType.value = ''
  showUploadArea.value = true
}

async function copyPrompt() {
  if (!currentPrompt.value) return
  await navigator.clipboard.writeText(currentPrompt.value)
  showToast('Prompt已复制，打开 AI 工具粘贴即可')
}

async function pasteResult() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      parseResult.value = text
      showToast('AI结果已粘贴')
    }
  } catch {
    showToast('请手动粘贴')
  }
}

function applyParsedResult() {
  if (!parseResult.value) return
  // 尝试从AI返回的文本中提取JSON
  const jsonMatch = parseResult.value.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    showToast('未检测到结构化数据，请确认AI是否按指定JSON格式输出')
    return
  }
  try {
    const data = JSON.parse(jsonMatch[0])
    if (data.name) r.name = data.name
    if (data.email) r.email = data.email
    if (data.phone) r.phone = data.phone
    if (data.targetRoles) r.targetRoles = data.targetRoles
    if (data.strengths) r.strengths = data.strengths
    if (data.education) {
      if (data.education.school) r.education.school = data.education.school
      if (data.education.major) r.education.major = data.education.major
      if (data.education.degree) r.education.degree = data.education.degree
      if (data.education.gpa) r.education.gpa = data.education.gpa
      if (data.education.graduation) r.education.graduation = data.education.graduation
    }
    if (data.skills && Array.isArray(data.skills)) {
      r.skills = data.skills
    }
    if (data.experiences && Array.isArray(data.experiences)) {
      r.experiences = data.experiences
    }
    if (data.projects && Array.isArray(data.projects)) {
      r.projects = data.projects
    }
    showToast('简历已自动填充！请逐项核对')
  } catch (e) {
    showToast('解析失败，请确认AI输出格式正确')
  }
}

// ---- 以下是手动编辑功能 ----
function addSkill() {
  if (!newSkill.value.name) return
  r.skills.push({ ...newSkill.value })
  newSkill.value = { name: '', level: '熟练', category: 'AI/LLM' }
  showToast('技能已添加')
}
function removeSkill(i) { r.skills.splice(i, 1) }

function addExp() {
  if (!newExp.value.company || !newExp.value.role) return
  r.experiences.push({ ...newExp.value })
  newExp.value = { company: '', role: '', duration: '', highlights: '' }
  showToast('经历已添加')
}
function removeExp(i) { r.experiences.splice(i, 1) }

function addProj() {
  if (!newProj.value.name) return
  r.projects.push({ ...newProj.value })
  newProj.value = { name: '', description: '', highlights: '' }
  showToast('项目已添加')
}
function removeProj(i) { r.projects.splice(i, 1) }

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2500)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>📋 我的简历</h1>
      <p class="page-desc">上传简历文件自动解析，或手动填写。用于后续的人岗匹配和面试准备。</p>
    </div>

    <!-- ===== 文件上传区 ===== -->
    <div v-if="showUploadArea" class="card">
      <div
        :class="['upload-zone', { dragging: isDragging }]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="() => $refs.fileInput.click()"
      >
        <div v-if="isProcessing" class="upload-status">
          <div class="spinner"></div>
          <p>正在解析文件...</p>
        </div>
        <div v-else>
          <div class="upload-icon">📁</div>
          <div class="upload-title">拖拽或点击上传简历</div>
          <div class="upload-hint">支持 PDF / Word / 图片 / TXT</div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
          style="display:none"
          @change="onFileInput"
        />
      </div>
    </div>

    <!-- ===== 解析后：文本预览 + Prompt操作 ===== -->
    <div v-if="extractedText && fileType !== 'image'" class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;">📄 已提取文字 — {{ fileName }}</h3>
        <button class="btn btn-xs" @click="resetUpload">重新上传</button>
      </div>
      <div class="result-block" style="max-height:200px;font-size:13px;">{{ extractedText.slice(0, 1500) }}{{ extractedText.length > 1500 ? '...' : '' }}</div>
    </div>

    <!-- 图片预览 -->
    <div v-if="extractedText && fileType === 'image'" class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;">🖼️ 简历图片 — {{ fileName }}</h3>
        <button class="btn btn-xs" @click="resetUpload">重新上传</button>
      </div>
      <img :src="extractedText" style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid var(--border);" />
    </div>

    <!-- Prompt操作 -->
    <div v-if="extractedText" class="card">
      <h3>{{ fileType === 'image' ? '🖼️ 图片解析' : '🤖 AI解析Prompt' }}</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">
        {{ fileType === 'image'
          ? '复制以下Prompt，配合图片一起发送给多模态AI（ChatGPT/Claude/Gemini等）'
          : '复制以下Prompt到 AI 工具获取结构化提取结果' }}
      </p>

      <div v-if="fileType !== 'image'" class="result-block" style="font-family:monospace;font-size:13px;max-height:300px;">
        {{ currentPrompt }}
      </div>
      <div v-else class="result-block" style="font-size:13px;">
        {{ currentPrompt }}
      </div>

      <div class="btn-group" style="margin-top:12px;">
        <button class="btn btn-primary" @click="copyPrompt">📋 复制Prompt</button>
        <button class="btn" @click="resetUpload">重选文件</button>
      </div>
    </div>

    <!-- AI结果粘贴 + 自动填充 -->
    <div v-if="extractedText" class="card" style="border-color: var(--success);">
      <h3>📥 AI结构化结果</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">
        把AI返回的JSON结果粘贴到下方，点击「自动填充」一键填入简历
      </p>
      <textarea class="textarea" v-model="parseResult" placeholder="粘贴AI返回的JSON结果..." rows="6"></textarea>
      <div class="btn-group" style="margin-top:8px;">
        <button class="btn btn-sm" @click="pasteResult">📥 从剪贴板粘贴</button>
        <button v-if="parseResult" class="btn btn-primary btn-sm" @click="applyParsedResult">✨ 自动填充简历</button>
      </div>
    </div>

    <!-- ===== 手动编辑区 ===== -->
    <div style="margin-top:24px;">
      <h2 style="margin-bottom:12px;">✏️ 手动编辑简历</h2>
    </div>

    <!-- 基本信息 -->
    <div class="card">
      <h3>基本信息</h3>
      <div class="grid-2">
        <div class="form-group">
          <label class="label">姓名</label>
          <input class="input" v-model="r.name" placeholder="你的姓名" />
        </div>
        <div class="form-group">
          <label class="label">邮箱</label>
          <input class="input" v-model="r.email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="label">手机</label>
          <input class="input" v-model="r.phone" placeholder="手机号" />
        </div>
        <div class="form-group">
          <label class="label">目标岗位</label>
          <input class="input" v-model="r.targetRoles" placeholder="如：AI产品经理、策略产品经理" />
        </div>
      </div>
    </div>

    <!-- 教育背景 -->
    <div class="card">
      <h3>教育背景</h3>
      <div class="grid-2">
        <div class="form-group">
          <label class="label">学校</label>
          <input class="input" v-model="r.education.school" placeholder="学校名称" />
        </div>
        <div class="form-group">
          <label class="label">专业</label>
          <input class="input" v-model="r.education.major" placeholder="专业名称" />
        </div>
        <div class="form-group">
          <label class="label">学历</label>
          <select class="select" v-model="r.education.degree">
            <option value="">请选择</option>
            <option>本科</option>
            <option>硕士</option>
            <option>博士</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">GPA</label>
          <input class="input" v-model="r.education.gpa" placeholder="如：3.8/4.0" />
        </div>
        <div class="form-group">
          <label class="label">毕业时间</label>
          <input class="input" v-model="r.education.graduation" placeholder="如：2026年6月" />
        </div>
      </div>
    </div>

    <!-- 技能 -->
    <div class="card">
      <h3>技能清单</h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
        <span v-for="(s, i) in r.skills" :key="i" class="tag tag-accent" style="cursor:pointer" @click="removeSkill(i)">
          {{ s.name }} · {{ s.level }} · {{ s.category }} ✕
        </span>
        <span v-if="r.skills.length === 0" style="color:var(--text-muted);font-size:13px;">尚未添加技能</span>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="label">技能名称</label>
          <input class="input" v-model="newSkill.name" placeholder="如：Prompt Engineering" @keyup.enter="addSkill" />
        </div>
        <div class="form-group">
          <label class="label">掌握程度</label>
          <select class="select" v-model="newSkill.level">
            <option v-for="l in levels" :key="l">{{ l }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">分类</label>
          <select class="select" v-model="newSkill.category">
            <option v-for="c in skillCategories" :key="c">{{ c }}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" @click="addSkill">+ 添加技能</button>
    </div>

    <!-- 实习经历 -->
    <div class="card">
      <h3>实习/工作经历</h3>
      <div v-for="(exp, i) in r.experiences" :key="i" class="result-block" style="position:relative;">
        <strong>{{ exp.company }}</strong> | {{ exp.role }} | {{ exp.duration }}
        <br>{{ exp.highlights }}
        <button class="btn btn-xs" style="position:absolute;top:8px;right:8px;" @click="removeExp(i)">删除</button>
      </div>
      <div class="grid-2" style="margin-top:12px;">
        <div class="form-group">
          <label class="label">公司</label>
          <input class="input" v-model="newExp.company" placeholder="公司名称" />
        </div>
        <div class="form-group">
          <label class="label">岗位</label>
          <input class="input" v-model="newExp.role" placeholder="岗位名称" />
        </div>
        <div class="form-group">
          <label class="label">时间</label>
          <input class="input" v-model="newExp.duration" placeholder="如：2025.07 - 2026.01" />
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="label">工作亮点</label>
          <textarea class="textarea" v-model="newExp.highlights" placeholder="描述你的主要产出和成果" rows="3"></textarea>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" @click="addExp">+ 添加经历</button>
    </div>

    <!-- 项目经历 -->
    <div class="card">
      <h3>项目经历</h3>
      <div v-for="(proj, i) in r.projects" :key="i" class="result-block" style="position:relative;">
        <strong>{{ proj.name }}</strong>
        <br>{{ proj.description }}
        <br><span style="color:var(--text-secondary);font-size:13px;">亮点：{{ proj.highlights }}</span>
        <button class="btn btn-xs" style="position:absolute;top:8px;right:8px;" @click="removeProj(i)">删除</button>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label class="label">项目名称</label>
        <input class="input" v-model="newProj.name" placeholder="项目名称" />
      </div>
      <div class="form-group">
        <label class="label">项目描述</label>
        <input class="input" v-model="newProj.description" placeholder="一句话描述项目" />
      </div>
      <div class="form-group">
        <label class="label">项目亮点</label>
        <textarea class="textarea" v-model="newProj.highlights" placeholder="技术栈、核心成果等" rows="2"></textarea>
      </div>
      <button class="btn btn-primary btn-sm" @click="addProj">+ 添加项目</button>
    </div>

    <!-- 个人优势 -->
    <div class="card">
      <h3>个人优势</h3>
      <textarea class="textarea" v-model="r.strengths" placeholder="总结你的核心竞争力..." rows="3"></textarea>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover, .upload-zone.dragging {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.upload-icon { font-size: 48px; margin-bottom: 8px; }
.upload-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.upload-hint { font-size: 13px; color: var(--text-muted); }
.upload-status { padding: 20px; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
