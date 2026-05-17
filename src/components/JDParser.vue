<script setup>
import { ref } from 'vue'
import { useStore } from '../stores/useStore.js'
import { JD_PARSE_PROMPT, JD_QUICK_SCAN_PROMPT } from '../prompts/templates.js'

const { state, addJob } = useStore()

const jdText = ref('')
const jdTitle = ref('')
const jdCompany = ref('')
const jdUrl = ref('')
const parsedResult = ref('')
const toast = ref('')
const mode = ref('deep') // deep | quick

function getPrompt() {
  const text = jdText.value.trim()
  if (!text) return ''
  if (mode.value === 'quick') {
    return JD_QUICK_SCAN_PROMPT.replace('{jd_text}', text)
  }
  return JD_PARSE_PROMPT.replace('{jd_text}', text)
}

async function copyPrompt() {
  const prompt = getPrompt()
  if (!prompt) return
  await navigator.clipboard.writeText(prompt)
  showToast('Prompt已复制，打开ChatGPT/Claude/DeepSeek粘贴即可')
}

function saveJD() {
  if (!jdText.value.trim()) return
  addJob({
    title: jdTitle.value || '未命名岗位',
    company: jdCompany.value || '未知公司',
    url: jdUrl.value,
    rawJD: jdText.value,
    parsedResult: parsedResult.value || null,
  })
  showToast('JD已保存，可在"人岗匹配"和"面试准备"中使用')
  jdText.value = ''
  jdTitle.value = ''
  jdCompany.value = ''
  jdUrl.value = ''
  parsedResult.value = ''
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2500)
}

function pasteResult() {
  navigator.clipboard.readText().then(text => {
    if (text) {
      parsedResult.value = text
      showToast('AI分析结果已粘贴，可以保存到JD库')
    }
  }).catch(() => {
    showToast('无法读取剪贴板，请手动粘贴')
  })
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>🔍 JD智能解析</h1>
      <p class="page-desc">粘贴职位描述，一键生成专业分析Prompt。复制后带到任何AI工具中获取结构化解析结果。</p>
    </div>

    <div class="card">
      <div class="form-group">
        <label class="label">岗位名称</label>
        <input class="input" v-model="jdTitle" placeholder="如：AI产品经理实习生" />
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="label">公司</label>
          <input class="input" v-model="jdCompany" placeholder="如：字节跳动" />
        </div>
        <div class="form-group">
          <label class="label">JD链接（可选）</label>
          <input class="input" v-model="jdUrl" placeholder="招聘页面链接" />
        </div>
      </div>
      <div class="form-group">
        <label class="label">职位描述（JD正文）</label>
        <textarea
          class="textarea"
          v-model="jdText"
          placeholder="直接粘贴JD全文即可，支持任意格式..."
          rows="8"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="label">分析模式</label>
        <div class="btn-group">
          <button :class="['btn btn-sm', { 'btn-primary': mode === 'deep' }]" @click="mode = 'deep'">
            深度分析（推荐）
          </button>
          <button :class="['btn btn-sm', { 'btn-primary': mode === 'quick' }]" @click="mode = 'quick'">
            快速扫描
          </button>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">
          {{ mode === 'deep' ? '结构化拆解：硬性要求、隐性期待、关键词、岗位画像' : '3句话快速总结JD核心信息' }}
        </p>
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" :disabled="!jdText.trim()" @click="copyPrompt">
          📋 一键复制Prompt
        </button>
        <button class="btn" :disabled="!jdText.trim()" @click="saveJD">
          💾 保存JD到库
        </button>
      </div>

      <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">
        复制后 → 打开 ChatGPT / Claude / DeepSeek / 豆包 → 粘贴Prompt → 获得结构化分析 → 回到这里粘贴结果
      </p>
    </div>

    <!-- Prompt预览 -->
    <div v-if="jdText.trim()" class="card">
      <h3>生成的Prompt预览</h3>
      <div class="result-block" style="font-family: monospace; font-size: 13px;">{{ getPrompt() }}</div>
    </div>

    <!-- AI结果粘贴区 -->
    <div class="card">
      <h3>AI分析结果（粘贴到这里）</h3>
      <textarea
        class="textarea"
        v-model="parsedResult"
        placeholder="把AI的分析结果粘贴到这里，点击保存即可存入JD库..."
        rows="6"
      ></textarea>
      <div class="btn-group" style="margin-top:8px;">
        <button class="btn btn-sm" @click="pasteResult">📥 从剪贴板粘贴</button>
        <button
          v-if="parsedResult"
          class="btn btn-primary btn-sm"
          @click="saveJD"
        >💾 保存结果</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>
