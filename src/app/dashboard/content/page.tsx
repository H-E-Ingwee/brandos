'use client'

import { useState } from 'react'
import { MessageSquare, Copy, CheckCircle, RefreshCw, Calendar, Instagram, Linkedin, Lock, Sparkles } from 'lucide-react'

const contentPillars = [
  { id: 'education', name: 'Education', percent: 70, color: '#1A7A6E', desc: 'Skincare tips, ingredient spotlights, how-to guides' },
  { id: 'community', name: 'Community', percent: 20, color: '#D9910B', desc: 'Behind-the-scenes, team stories, customer features' },
  { id: 'promotion', name: 'Promotion', percent: 10, color: '#F25C05', desc: 'Product launches, offers, announcements' },
]

const samplePosts = [
  {
    id: 1,
    platform: 'Instagram',
    type: 'Educational Carousel',
    pillar: 'Education',
    caption: '5 reasons why your skincare isn\'t working in Nairobi 🌿\n\nMost skincare products are formulated for European climates — not for Nairobi\'s humidity and UV levels. Here\'s what\'s actually happening to your skin:\n\n1️⃣ The humidity here is different — products that work in London feel heavy and pore-clogging in Nairobi\n2️⃣ Our UV index is higher — you need SPF 30+ every single day, not just when it\'s sunny\n3️⃣ Hard water in Nairobi affects your skin barrier — always use a toner after cleansing\n4️⃣ Imported products often contain ingredients that lighten African skin tones — check your labels\n5️⃣ Your skin needs different hydration in dry season vs rainy season — your routine should change\n\nAt Savanna Skincare, we formulate specifically for Kenyan skin and climate. Every product is tested here, not in a lab in Europe.\n\nSave this post and share it with someone who needs to hear this 💚\n\n#KenyaSkincare #NaturalBeautyKenya #SkincareTips #AfricanSkin #NairobiBeauty #SavannaSkincare',
    hashtags: '#KenyaSkincare #NaturalBeautyKenya #SkincareTips #AfricanSkin #NairobiBeauty',
    bestTime: 'Tuesday 7:30am or 8:00pm EAT',
    engagement: 'High — educational carousels get 3x more saves than single images',
  },
  {
    id: 2,
    platform: 'Instagram',
    type: 'Reel',
    pillar: 'Education',
    caption: 'POV: You finally found a moisturiser that actually works for your skin 🙌\n\nKenyan skin is not the same as European skin. We need products that understand our climate, our melanin, and our lifestyle.\n\nSavanna Shea Glow Moisturiser:\n✅ Formulated for Nairobi humidity\n✅ SPF 20 built in\n✅ Locally sourced shea butter from Turkana\n✅ No skin-lightening agents\n✅ Tested on African skin tones\n\nLink in bio to shop 🛒\n\n#SavannaSkincare #KenyaBeauty #NaturalSkincare #MadeInKenya',
    hashtags: '#SavannaSkincare #KenyaBeauty #NaturalSkincare #MadeInKenya',
    bestTime: 'Thursday 7:00pm EAT',
    engagement: 'Very High — product Reels with before/after get highest reach',
  },
  {
    id: 3,
    platform: 'WhatsApp',
    type: 'Broadcast Message',
    pillar: 'Education',
    caption: 'Habari [Name]! 👋\n\nQuick skincare tip for this week:\n\nDid you know that Nairobi\'s altitude (1,795m above sea level) means your skin loses moisture faster than at sea level? This is why so many people in Nairobi struggle with dry skin even when they moisturise regularly.\n\nThe fix: Apply your moisturiser within 60 seconds of washing your face — while your skin is still slightly damp. This locks in the moisture before it evaporates.\n\nTry it this week and let me know if you notice a difference! 💚\n\n— Amina, Savanna Skincare\n\nP.S. Our Shea Glow Moisturiser is specially formulated for Nairobi\'s altitude. Reply "SHOP" to see our current offers.',
    hashtags: '',
    bestTime: 'Tuesday or Thursday, 8:00am EAT',
    engagement: 'Very High — personalised WhatsApp messages get 70%+ open rates',
  },
  {
    id: 4,
    platform: 'LinkedIn',
    type: 'Thought Leadership',
    pillar: 'Education',
    caption: 'The skincare industry has a Kenya problem — and it\'s costing consumers millions.\n\nEvery year, Kenyan consumers spend billions on imported skincare products that were never formulated for African skin or the Kenyan climate.\n\nThe result? Products that:\n• Feel too heavy in Nairobi\'s humidity\n• Don\'t account for our higher UV index\n• Contain ingredients that affect melanin-rich skin differently\n• Are priced in dollars but sold to KES-earning consumers\n\nAt Savanna Skincare, we\'re building something different: premium natural skincare formulated specifically for Kenyan skin, using locally sourced ingredients, at a price that makes sense for the Kenyan market.\n\nWe\'re not adapting a Western formula. We\'re starting from scratch — with Kenyan skin, Kenyan climate, and Kenyan consumers at the centre.\n\nThis is what "Made in Kenya" should mean.\n\n#MadeInKenya #KenyaBeauty #AfricanSkincare #Entrepreneurship #NairobiStartup',
    hashtags: '#MadeInKenya #KenyaBeauty #AfricanSkincare #Entrepreneurship',
    bestTime: 'Wednesday 8:00am EAT',
    engagement: 'High — thought leadership posts build brand authority and attract B2B partnerships',
  },
]

const calendarWeek = [
  { day: 'Mon', platform: 'Instagram', type: 'Educational Carousel', time: '7:30am', pillar: 'Education' },
  { day: 'Tue', platform: 'WhatsApp', type: 'Weekly Tip Broadcast', time: '8:00am', pillar: 'Education' },
  { day: 'Wed', platform: 'TikTok', type: 'Skincare Routine Video', time: '7:00pm', pillar: 'Education' },
  { day: 'Thu', platform: 'Instagram', type: 'Product Reel', time: '7:00pm', pillar: 'Promotion' },
  { day: 'Fri', platform: 'Instagram', type: 'Customer Feature / UGC', time: '12:00pm', pillar: 'Community' },
  { day: 'Sat', platform: 'TikTok', type: 'Behind-the-Scenes', time: '10:00am', pillar: 'Community' },
  { day: 'Sun', platform: 'Instagram', type: 'Inspirational Quote', time: '9:00am', pillar: 'Community' },
]

const pillarColors: Record<string, string> = { Education: '#1A7A6E', Community: '#D9910B', Promotion: '#F25C05' }

export default function ContentPage() {
  const [selectedPost, setSelectedPost] = useState(samplePosts[0])
  const [copied, setCopied] = useState(false)
  const [isPro] = useState(false)

  const copyCaption = () => {
    navigator.clipboard.writeText(selectedPost.caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <p className="text-white/40 text-sm">AI-generated content for Savanna Skincare</p>
          </div>
        </div>
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isPro ? 'bg-[#D9910B]/10 border border-[#D9910B]/20 text-[#D9910B]' : 'bg-[#1A2E3D] border border-white/8 text-white/30 cursor-not-allowed'}`}>
          {isPro ? <Calendar className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          Schedule Posts (Pro)
        </button>
      </div>

      {/* Content Pillars */}
      <section className="mb-10">
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
      <section className="mb-10">
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

      {/* Content Library */}
      <section>
        <h2 className="text-lg font-display font-semibold text-white mb-1">Ready-to-Use Content</h2>
        <p className="text-white/40 text-sm mb-5">AI-generated captions in your brand voice — copy and post</p>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Post selector */}
          <div className="space-y-2">
            {samplePosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPost.id === post.id ? 'bg-[#F25C05]/10 border-[#F25C05]/30' : 'bg-[#1A2E3D] border-white/8 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: pillarColors[post.pillar] }}>{post.platform}</span>
                  <span className="text-white/30 text-[10px]">·</span>
                  <span className="text-white/40 text-[10px]">{post.type}</span>
                </div>
                <div className="text-white/70 text-xs leading-relaxed line-clamp-2">{post.caption.substring(0, 80)}...</div>
              </button>
            ))}
            <button className="w-full p-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-[#F25C05]/30 hover:text-[#F25C05] transition-all flex items-center justify-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" /> Generate More
            </button>
          </div>

          {/* Post detail */}
          <div className="lg:col-span-2">
            <div className="bg-[#1A2E3D] border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: pillarColors[selectedPost.pillar] }}>{selectedPost.platform}</span>
                  <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded-full">{selectedPost.type}</span>
                </div>
                <button onClick={copyCaption} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F25C05]/10 border border-[#F25C05]/20 text-[#F25C05] text-xs font-medium hover:bg-[#F25C05]/20 transition-all">
                  {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Caption</>}
                </button>
              </div>
              <div className="p-5">
                <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">{selectedPost.caption}</pre>
              </div>
              <div className="px-5 pb-5 space-y-3">
                <div className="bg-[#162330] rounded-xl p-3">
                  <div className="text-white/30 text-xs mb-1">Best time to post</div>
                  <div className="text-white/70 text-sm">{selectedPost.bestTime}</div>
                </div>
                <div className="bg-[#1A7A6E]/10 border border-[#1A7A6E]/20 rounded-xl p-3">
                  <div className="text-[#1A7A6E] text-xs mb-1 font-semibold">Expected Performance</div>
                  <div className="text-white/60 text-sm">{selectedPost.engagement}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}