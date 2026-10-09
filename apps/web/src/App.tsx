import React from 'react'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { LanguageProvider } from './context/LanguageProvider.tsx'
import { Navbar } from './components/Navbar.tsx'
import { HeroSection } from './components/HeroSection.tsx'
import { AgentOrchestrationDemo } from './components/AgentOrchestrationDemo.tsx'
import { BentoFeatures } from './components/BentoFeatures.tsx'
import { SecurityArchitecture } from './components/SecurityArchitecture.tsx'
import { ComparisonTable } from './components/ComparisonTable.tsx'
import { DownloadSection } from './components/DownloadSection.tsx'
import { FaqSection } from './components/FaqSection.tsx'
import { Footer } from './components/Footer.tsx'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#fafafc] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-800 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200">
          {/* Accessible Skip Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:text-xs focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Skip to main content
          </a>

          {/* Sticky Glass Navbar */}
          <Navbar />

          {/* Main Content Sections */}
          <main id="main-content" className="flex-1">
            {/* 1. Hero Section with Creative Living Agent Studio */}
            <HeroSection />

            {/* 2. Interactive Multi-Agent Orchestration Playground */}
            <AgentOrchestrationDemo />

            {/* 3. Bento Grid of 6 Core Pillars */}
            <BentoFeatures />

            {/* 4. Rust Security & Architectural Guarantees */}
            <div id="architecture">
              <SecurityArchitecture />
            </div>

            {/* 5. Direct Comparison Table */}
            <ComparisonTable />

            {/* 6. Windows Download & Quickstart */}
            <DownloadSection />

            {/* 7. Comprehensive FAQ */}
            <FaqSection />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
