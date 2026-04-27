import { shouldUseMockData } from '@/data/mockMusicData'

const DemoModeBadge = () => {
  const isDemoMode = shouldUseMockData()

  if (!isDemoMode) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center gap-2 animate-pulse">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
      <span>No API Mode</span>
    </div>
  )
}

export default DemoModeBadge
