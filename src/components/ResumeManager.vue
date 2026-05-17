<script setup>
import { ref } from 'vue'
import { useStore } from '../stores/useStore.js'

const { state } = useStore()
const r = state.resume

const newSkill = ref({ name: '', level: '熟练', category: 'AI/LLM' })
const newExp = ref({ company: '', role: '', duration: '', highlights: '' })
const newProj = ref({ name: '', description: '', highlights: '' })
const toast = ref('')

const skillCategories = ['AI/LLM', '数据分析', '产品设计', '编程语言', '外语', '其他']
const levels = ['精通', '熟练', '了解']

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
  setTimeout(() => { toast.value = '' }, 2000)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>📋 我的简历</h1>
      <p class="page-desc">维护你的简历信息库，用于后续的人岗匹配和面试准备。</p>
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
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
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
      <textarea class="textarea" v-model="r.strengths" placeholder="总结你的核心竞争力，如：具备AI产品从0到1的完整交付经验..." rows="3"></textarea>
    </div>

    <Teleport to="body">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Teleport>
  </div>
</template>
