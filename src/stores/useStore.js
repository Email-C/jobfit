import { reactive, watch } from 'vue'

const STORAGE_KEY = 'jobfit_data'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function createDefault() {
  return {
    resume: {
      name: '',
      email: '',
      phone: '',
      education: { school: '', major: '', degree: '', gpa: '', graduation: '' },
      skills: [],
      experiences: [],
      projects: [],
      strengths: '',
      targetRoles: '',
    },
    jobs: [],
    selectedJobId: null,
  }
}

const state = reactive(load() || createDefault())

watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useStore() {
  function addJob(job) {
    state.jobs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...job,
      createdAt: new Date().toISOString(),
      status: 'saved',
      parsedResult: null,
      matchResult: null,
      notes: '',
    })
  }

  function updateJob(id, updates) {
    const idx = state.jobs.findIndex(j => j.id === id)
    if (idx !== -1) Object.assign(state.jobs[idx], updates)
  }

  function removeJob(id) {
    state.jobs = state.jobs.filter(j => j.id !== id)
    if (state.selectedJobId === id) state.selectedJobId = null
  }

  function getJob(id) {
    return state.jobs.find(j => j.id === id)
  }

  function getResumeText() {
    const r = state.resume
    if (!r.name && !r.education.school) return ''

    let text = ''
    if (r.name) text += `姓名：${r.name}\n`
    if (r.email) text += `邮箱：${r.email}\n`

    const ed = r.education
    if (ed.school) {
      text += `\n教育背景：\n${ed.degree} | ${ed.school} | ${ed.major}`
      if (ed.gpa) text += ` | GPA ${ed.gpa}`
      if (ed.graduation) text += ` | ${ed.graduation}`
      text += '\n'
    }

    if (r.skills.length > 0) {
      const byCat = {}
      r.skills.forEach(s => {
        if (!byCat[s.category]) byCat[s.category] = []
        byCat[s.category].push(`${s.name}(${s.level})`)
      })
      text += '\n技能：\n'
      Object.entries(byCat).forEach(([cat, items]) => {
        text += `  ${cat}：${items.join('、')}\n`
      })
    }

    if (r.experiences.length > 0) {
      text += '\n实习/工作经历：\n'
      r.experiences.forEach(exp => {
        text += `${exp.company} | ${exp.role} | ${exp.duration}\n`
        text += `${exp.highlights}\n\n`
      })
    }

    if (r.projects.length > 0) {
      text += '项目经历：\n'
      r.projects.forEach(proj => {
        text += `${proj.name}：${proj.description}\n`
        if (proj.highlights) text += `亮点：${proj.highlights}\n\n`
      })
    }

    if (r.strengths) text += `\n个人优势：${r.strengths}\n`
    if (r.targetRoles) text += `目标岗位：${r.targetRoles}\n`

    return text.trim()
  }

  function getJobStats() {
    const stats = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0, total: state.jobs.length }
    state.jobs.forEach(j => { if (stats[j.status] !== undefined) stats[j.status]++ })
    return stats
  }

  return {
    state,
    addJob,
    updateJob,
    removeJob,
    getJob,
    getResumeText,
    getJobStats,
  }
}
