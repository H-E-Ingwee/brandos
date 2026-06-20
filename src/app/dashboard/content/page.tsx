'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Copy, CheckCircle, Calendar, Sparkles, Loader2, AlertCircle, Lock, RefreshCw, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ContentPost } from '@/lib/supabase/types'

const contentPillars = [
  { id: 'education', name: 'Education', percent: 70, color: '#1A7A6E', desc: 'Skincare tips, ingredient spotlights, how-to guides' },
  { id: 'community', name: 'Community', percent: 20, color: '#D9910B', desc: 'Behind-the-scenes, team stories, customer features' },
  { id: 'promotion', name: 'Promotion', percent: 10, color: '#F25C05', desc: 'Product launches, offers, announcements' },
]

const platforms = ['instagram', 'whatsapp', 'tiktok', 'linkedin', 'facebook', 'twitter']
const platformIcons: Record<string, string> = { instagram: '📸', whatsapp: '💬', tiktok: '🎵', linkedin: '💼', facebook: '👥', twitter: '🐦' }
const pillarColors: Record<string, string> = { education: '#1A7A6E', community: '#D9910B', promotion: '#F25C05' }

const calendarWeek = [
  { day: 'Mon', platform: 'Instagram', type: 'Educational Carousel', time: '7:30am', pillar: 'education' },
  { day: 'Tue', platform: 'WhatsApp', type: 'Weekly Tip Broadcast', time: '8:00am', pillar: 'education' },
  { day: 'Wed', platform: 'TikTok', type: 'Short Video', time: '7:00pm', pillar: 'education' },
  { day: 'Thu', platform: 'Instagram', type: 'Product / Service Post', time: '7:00pm', pillar: 'promotion' },
  { day: 'Fri', platform: 'Instagram', type: 'Customer Feature / UGC', time: '12:00pm', pillar: 'community' },
  { day: 'Sat', platform: 'TikTok', type: 'Behind-the-Scenes', time: '10:00am', pillar: 'community' },
  { day: 'Sun', platform: 'Instagram', type: 'Inspirational Quote', time: '9:00am', pillar: 'community' },
]

export default function ContentPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [discoveryComplete, setDiscoveryComplete] = useState(false)

  // Generate form state
  const [genPlatform, setGenPlatform] = useState('instagram')
  const [genPillar, setGenPillar] = useState<'education' | 'community' | 'promotion'>('education')
  const [genTopic, setGenTopic] = useState('')
  const [showGenerateForm, setShowGenerateForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, postsRes, discoveryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('content_posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('brand_discovery').select('completed').eq('user_id', user.id).single(),
    ])

    setProfile(profileRes.data)
    setPosts(postsRes.data || [])
    setDiscoveryComplete(discoveryRes.data?.completed || false)
    if (postsRes.data && postsRes.data.length > 0) setSelectedPost(postsRes.data[0])
    setLoading(false)
  }

  const generatePost = async () => {
    if (!genTopic.trim()) { setError('Please enter a topic for your post'); return }
    setGenerating(true)
    setError('')
    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: genPlatform, pillar: genPillar, topic: genTopic, save: true }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to generate content'); return }

      // Refresh posts list
      await fetchData()
      setGenTopic('')
      setShowGenerateForm(false)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const deletePost = async (postId: string) => {
    const supabase = createClient()
    await supabase.from('content_posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
    if (selectedPost?.id === postId) setSelectedPost(posts.find(p => p.id !== postId) || null)
  }

  const copyCaption = () => {
    if (!selectedPost) return
    navigator.clipboard.writeText(selectedPost.caption + (selectedPost.hashtags ? '\n\n' + selectedPost.hashtags : ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F25C05]/30 border-t-[#F25C05] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9910B]/15 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#D9910B]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Content Engine</h1>
            <p className="text-white/40 text-sm">{posts.length} posts generated · AI-powered for your brand</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isPro ? 'bg-[#D9910B]/10 border border-[#D9910B]/20 text-[#D9910B]' : 'bg-[#1A2E3D] border border-white/8 text-white/30 cursor-not-allowed'}`}>
            {isPro ? <Calendar className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Schedule Posts (Pro)
          </button>
        </div>
      </div>

      {/* Discovery required */}
      {!discoveryComplete && (
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-6 text-center mb-8">
          <AlertCircle className="w-8 h-8 text-[#F25C05] mx-auto mb-3" />
          <h2 className="text-white font-display font-semibold mb-2">Complete Brand Discovery First</h2>
          <p className="text-white/50 text-sm mb-4">Your content is generated in your brand's voice. Complete discovery first.</p>
          <a href="/dashboard/discovery" className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
            Go to Brand Discovery
          </a>
        </div>
      )}

      {/* Content Pillars */}
      <section className="mb-8">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Content Pillars</h2>
        <p className="text-white/40 text-sm mb-5">The 70-20-10 rule — proven to build trust and drive sales</p>
        <div className="grid md:grid-cols-3 gap-4">
          {contentPillars.map((p) => (
            <div key={p.id} className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold text-sm">{p.name}</span>
                <span className="font-display font-bold text-2xl" style={{ color: p.color }}>{p.percent}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${p.percent}%`, backgroundColor: p.color }} />
              </div>
              <p className="text-white/40 text-xs">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Calendar */}
      <section className="mb-8">
        <h2 className="text-lg font-display font-semibold text-white mb-1">Weekly Content Calendar</h2>
        <p className="text-white/40 text-sm mb-5">Optimised posting schedule for maximum reach in Kenya</p>
        <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/5">
            {calendarWeek.map((day) => (
              <div key={day.day} className="p-3 border-r border-white/5 last:border-r-0">
                <div className="text-white/30 text-xs font-semibold uppercase mb-2">{day.day}</div>
                <div className="bg-[#162330] rounded-lg p-2 mb-1">
                  <div className="text-[10px] font-bold mb-1" style={{ color: pillarColors[day.pillar] }}>{day.platform}</div>
                  <div className="text-white/60 text-[10px] leading-tight">{day.type}</div>
                </div>
                <div className="text-white/20 text-[10px]">{day.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generate + Library */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-semibold text-white">Content Library</h2>
            <p className="text-white/40 text-sm">{posts.length} posts · AI-generated in your brand voice</p>
          </div>
          {discoveryComplete && (
            <button onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#F25C05]/20">
              <Sparkles className="w-4 h-4" /> Generate Post
            </button>
          )}
        </div>

        {/* Generate form */}
        {showGenerateForm && (
          <div className="bg-[#1A2E3D] border border-[#F25C05]/20 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Generate a New Post</h3>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Platform</label>
                <select value={genPlatform} onChange={e => setGenPlatform(e.target.value)}
                  className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 transition-all">
                  {platforms.map(p => <option key={p} value={p} className="bg-[#162330]">{platformIcons[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Content Pillar</label>
                <select value={genPillar} onChange={e => setGenPillar(e.target.value as any)}
                  className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F25C05]/60 transition-all">
                  <option value="education" className="bg-[#162330]">Education (70%)</option>
                  <option value="community" className="bg-[#162330]">Community (20%)</option>
                  <option value="promotion" className="bg-[#162330]">Promotion (10%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Topic / Idea</label>
                <input type="text" value={genTopic} onChange={e => setGenTopic(e.target.value)}
                  placeholder="e.g. skincare tips for Nairobi humidity"
                  onKeyDown={e => e.key === 'Enter' && generatePost()}
                  className="w-full bg-[#162330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F25C05]/60 transition-all" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={generatePost} disabled={generating || !genTopic.trim()}
                className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
              </button>
              <button onClick={() => { setShowGenerateForm(false); setError('') }}
                className="px-4 py-2.5 rounded-xl bg-[#162330] border border-white/10 text-white/50 hover:text-white text-sm transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No posts yet</h3>
            <p className="text-white/40 text-sm mb-4">Generate your first AI-powered social media post above.</p>
            {discoveryComplete && (
              <button onClick={() => setShowGenerateForm(true)}
                className="inline-flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94E00] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                <Sparkles className="w-4 h-4" /> Generate First Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Post list */}
            <div className="space-y-2">
              {posts.map((post) => (
                <button key={post.id} onClick={() => setSelectedPost(post)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPost?.id === post.id ? 'bg-[#F25C05]/10 border-[#F25C05]/30' : 'bg-[#1A2E3D] border-white/8 hover:border-white/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{platformIcons[post.platform]}</span>
                    <span className="text-xs font-bold" style={{ color: pillarColors[post.pillar || 'education'] }}>
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                    {post.post_type && <span className="text-white/30 text-[10px]">· {post.post_type}</span>}
                  </div>
                  <div className="text-white/70 text-xs leading-relaxed line-clamp-2">{post.caption.substring(0, 80)}...</div>
                  <div className="text-white/20 text-[10px] mt-1">{new Date(post.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                </button>
              ))}
              {discoveryComplete && (
                <button onClick={() => setShowGenerateForm(true)}
                  className="w-full p-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-[#F25C05]/30 hover:text-[#F25C05] transition-all flex items-center justify-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" /> Generate More
                </button>
              )}
            </div>

            {/* Post detail */}
            {selectedPost && (
              <div className="lg:col-span-2">
                <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{platformIcons[selectedPost.platform]}</span>
                      <span className="text-sm font-bold" style={{ color: pillarColors[selectedPost.pillar || 'education'] }}>
                        {selectedPost.platform.charAt(0).toUpperCase() + selectedPost.platform.slice(1)}
                      </span>
                      {selectedPost.post_type && <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded-full">{selectedPost.post_type}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={copyCaption}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-medium hover:bg-[#F25C05]/20 transition-all">
                        {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                      <button onClick={() => deletePost(selectedPost.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">{selectedPost.caption}</pre>
                    {selectedPost.hashtags && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[#1A7A6E] text-sm">{selectedPost.hashtags}</p>
                      </div>
                    )}
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {selectedPost.best_time && (
                      <div className="bg-[#162330] rounded-xl p-3">
                        <div className="text-white/30 text-xs mb-1">Best time to post</div>
                        <div className="text-white/70 text-sm">{selectedPost.best_time}</div>
                      </div>
                    )}
                    {selectedPost.engagement_prediction && (
                      <div className="bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-xl p-3">
                        <div className="text-[#1A7A6E] text-xs mb-1 font-semibold">Expected Performance</div>
                        <div className="text-white/60 text-sm">{selectedPost.engagement_prediction}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}