<script setup>
import { ref } from 'vue'
import JobTracker from './components/JobTracker.vue'
import ResumeManager from './components/ResumeManager.vue'
import JDParser from './components/JDParser.vue'
import MatchAnalyzer from './components/MatchAnalyzer.vue'
import InterviewPrep from './components/InterviewPrep.vue'
import { useStore } from './stores/useStore.js'

const { state } = useStore()

const tabs = [
  { id: 'tracker', label: '投递追踪', icon: '📊' },
  { id: 'resume', label: '我的简历', icon: '📋' },
  { id: 'jd', label: 'JD解析', icon: '🔍' },
  { id: 'match', label: '人岗匹配', icon: '🎯' },
  { id: 'interview', label: '面试准备', icon: '💡' },
]

const activeTab = ref('tracker')
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">🎯</span>
        <span class="logo-text">JobFit</span>
      </div>
      <nav class="nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
          <span v-if="tab.id === 'tracker'" class="badge">{{ state.jobs.length }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <a href="https://github.com/Email-C/jobfit" target="_blank" class="gh-link">GitHub</a>
      </div>
    </aside>

    <main class="main">
      <JobTracker v-if="activeTab === 'tracker'" />
      <ResumeManager v-else-if="activeTab === 'resume'" />
      <JDParser v-else-if="activeTab === 'jd'" />
      <MatchAnalyzer v-else-if="activeTab === 'match'" />
      <InterviewPrep v-else-if="activeTab === 'interview'" />
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 10;
}

.logo {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 700; color: var(--text); }

.nav {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.nav-item:hover { background: var(--bg-hover); color: var(--text); }
.nav-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 600; }

.nav-icon { font-size: 16px; flex-shrink: 0; }
.nav-label { flex: 1; }

.badge {
  background: var(--accent);
  color: white;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.gh-link {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
}

.main {
  flex: 1;
  margin-left: 200px;
  padding: 32px;
  max-width: 900px;
  width: 100%;
}

@media (max-width: 768px) {
  .sidebar { width: 60px; }
  .logo-text { display: none; }
  .nav-label { display: none; }
  .nav-item { justify-content: center; padding: 12px; }
  .nav-icon { font-size: 20px; }
  .main { margin-left: 60px; padding: 20px; }
}
</style>
