'use client'

import { useState, useEffect } from 'react'
import { FiPlay, FiClock, FiUser, FiTag, FiBook, FiSearch, FiFilter } from 'react-icons/fi'

interface VideosProps {
  user: any
}

export default function Videos({ user }: VideosProps) {
  const [videos, setVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    const stored = localStorage.getItem('stod_videos')
    if (stored) {
      setVideos(JSON.parse(stored))
    } else {
      // Sample videos based on Gary D. Kennedy's teachings
      const sampleVideos = [
        {
          id: 1,
          title: 'Same Thing Only Different - Deep Dive',
          description: 'A comprehensive exploration of pattern recognition and how to see the familiar in the unfamiliar. Real-world examples from business, technology, and life.',
          category: 'Universal Truth',
          duration: '24:35',
          instructor: 'Gary D. Kennedy',
          thumbnail: 'https://via.placeholder.com/400x225/4F46E5/FFFFFF?text=Pattern+Recognition',
          videoUrl: 'https://example.com/video1.mp4',
          views: 1247,
          likes: 89,
          principleId: 1,
          principleTitle: 'Same Thing Only Different - Pattern Recognition',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Published',
        },
        {
          id: 2,
          title: 'Pay Attention - The Art of Observation',
          description: 'Learn how to notice what others miss. Practical exercises for developing your observation skills and seeing the obvious that\'s right in front of you.',
          category: 'Wisdom',
          duration: '18:42',
          instructor: 'Gary D. Kennedy',
          thumbnail: 'https://via.placeholder.com/400x225/10B981/FFFFFF?text=Pay+Attention',
          videoUrl: 'https://example.com/video2.mp4',
          views: 892,
          likes: 67,
          principleId: 2,
          principleTitle: 'Pay Attention - The Power of Observation',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Published',
        },
        {
          id: 3,
          title: 'Context Matters - Understanding the Why',
          description: 'Why context is everything. How to ask the right questions and understand the full picture before acting. Case studies and real-world applications.',
          category: 'Problem Solving',
          duration: '31:15',
          instructor: 'Gary D. Kennedy',
          thumbnail: 'https://via.placeholder.com/400x225/F59E0B/FFFFFF?text=Context+Matters',
          videoUrl: 'https://example.com/video3.mp4',
          views: 654,
          likes: 54,
          principleId: 3,
          principleTitle: 'Context Matters - The Why Behind Everything',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Published',
        },
        {
          id: 4,
          title: 'Applying Principles to Real Life',
          description: 'How to take principles from theory to practice. Hard questions that matter and connecting every principle back to something you can use today.',
          category: 'Application',
          duration: '22:08',
          instructor: 'Gary D. Kennedy',
          thumbnail: 'https://via.placeholder.com/400x225/8B5CF6/FFFFFF?text=Real+Life+Application',
          videoUrl: 'https://example.com/video4.mp4',
          views: 543,
          likes: 43,
          principleId: 4,
          principleTitle: 'Apply to Real Life - Hard Questions That Matter',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Published',
        },
        {
          id: 5,
          title: 'Dissonance Matrix Workshop',
          description: 'Interactive workshop on using the Dissonance Matrix to identify tensions between principles and find your balance point.',
          category: 'Workshop',
          duration: '45:20',
          instructor: 'Sarah Curator',
          thumbnail: 'https://via.placeholder.com/400x225/EF4444/FFFFFF?text=Dissonance+Matrix',
          videoUrl: 'https://example.com/video5.mp4',
          views: 321,
          likes: 28,
          principleId: null,
          principleTitle: null,
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Published',
        },
      ]
      setVideos(sampleVideos)
      localStorage.setItem('stod_videos', JSON.stringify(sampleVideos))
    }
  }, [])

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))]

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.principleTitle && video.principleTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Universal Truth': 'from-blue-500 to-blue-600',
      'Wisdom': 'from-green-500 to-green-600',
      'Problem Solving': 'from-orange-500 to-orange-600',
      'Application': 'from-purple-500 to-purple-600',
      'Workshop': 'from-red-500 to-red-600',
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Video Library</h2>
        <p className="text-gray-600 mt-1">
          Access private preview videos and deep dives on principles. Learn from Gary D. Kennedy and other instructors.
        </p>
      </div>

      {selectedVideo ? (
        <div>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2"
          >
            ← Back to Library
          </button>

          <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
            <div className="mb-6">
              <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-600 opacity-80"></div>
                <div className="relative z-10 text-center text-white">
                  <FiPlay className="mx-auto text-6xl mb-4 opacity-90" />
                  <div className="text-lg font-semibold">{selectedVideo.title}</div>
                  <div className="text-sm opacity-75 mt-2">Video Player</div>
                  <div className="text-xs opacity-60 mt-4">
                    In production, this would load: {selectedVideo.videoUrl}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <FiClock />
                    <span>{selectedVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUser />
                    <span>{selectedVideo.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTag />
                    <span className={`bg-gradient-to-r ${getCategoryColor(selectedVideo.category)} text-white px-2 py-1 rounded-lg text-xs font-semibold`}>
                      {selectedVideo.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{selectedVideo.description}</p>
              </div>

              {selectedVideo.principleTitle && (
                <div className="p-4 bg-primary-50/70 rounded-lg border border-primary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiBook className="text-primary-600" />
                    <span className="font-semibold text-primary-900">Related Principle:</span>
                  </div>
                  <p className="text-primary-800">{selectedVideo.principleTitle}</p>
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                <div>
                  <span className="font-semibold">{selectedVideo.views.toLocaleString()}</span> views
                </div>
                <div>
                  <span className="font-semibold">{selectedVideo.likes}</span> likes
                </div>
                <div>
                  Uploaded {new Date(selectedVideo.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Video Grid */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40">
              <FiPlay className="mx-auto text-4xl mb-4 text-gray-300" />
              <p className="text-gray-500">No videos found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white/75 backdrop-blur-md rounded-xl shadow-md overflow-hidden border-2 border-white/30 hover:border-primary-300/50 transition-all cursor-pointer group"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="relative aspect-video bg-gradient-to-br from-primary-600 to-purple-600 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/40 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <FiPlay className="text-white text-3xl ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                      {video.duration}
                    </div>
                    <div className={`absolute top-2 left-2 bg-gradient-to-r ${getCategoryColor(video.category)} text-white px-2 py-1 rounded text-xs font-semibold`}>
                      {video.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiUser />
                        <span>{video.instructor}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{video.views} views</span>
                        <span>•</span>
                        <span>{video.likes} likes</span>
                      </div>
                    </div>
                    {video.principleTitle && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-primary-700">
                          <FiBook />
                          <span className="font-medium">{video.principleTitle}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

