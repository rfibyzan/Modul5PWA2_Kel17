import { useState } from 'react'
import {
  Shield,
  Copy,
  Check,
  Heart,
  FileText,
  Camera,
  Play,
  Mail,
  Archive,
  Edit2,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useDrafts } from '../hooks/useDrafts'
import { useArchivedGuns } from '../hooks/useArchivedGuns'
import userService from '../services/userService'
import { Tabs, TabItem } from '../components/ui'
import AboutSection from '../components/profile/AboutSection'
import ContactSection from '../components/profile/ContactSection'
import DraftsSection from '../components/profile/DraftsSection'
import ArchivedSection from '../components/profile/ArchivedSection'
import { Button } from '../components/ui'
import { useNavigate } from 'react-router-dom'

/**
 * ProfilePage — User identity and Armory settings.
 * Tabbed layout: Overview, About, Contact, Drafts, Arsip
 */
export default function ProfilePage({ onReplaySplash }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')

  const { favorites } = useFavorites()
  const { drafts: draftList } = useDrafts()
  const { guns: archivedGuns } = useArchivedGuns()

  const draftCount = draftList.length
  const archivedCount = archivedGuns.length

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Avatar image must be under 2MB.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setProfile(prev => ({ ...prev, avatar: base64 }))
      userService.updateAvatar(base64)
      setFeedback('Avatar updated.')
      setTimeout(() => setFeedback(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const tabKeys = ['overview', 'about', 'contact', 'drafts', 'archived']
  const selectedIndex = tabKeys.indexOf(activeTab) !== -1 ? tabKeys.indexOf(activeTab) : 0

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      navigate('/create')
    } else if (target === 'Edit') {
      navigate(`/edit/${payload.id}`)
    } else if (target === 'EditProfile') {
      navigate('/edit-profile')
    } else if (target === 'Catalog') {
      navigate('/catalog')
    }
  }

  return (
    <div className="profile-page">
      <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">
            Operator credentials, procurement statistics, and armorer details.
          </p>
        </div>
        {onReplaySplash && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onReplaySplash}
            title="Replay introductory splash animation"
          >
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden-file-input"
              />
            </label>
          </div>

          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCopyId}
                title="Copy User ID to clipboard"
              >
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
            {profile.bio && (
              <p className="profile-bio" style={{ marginTop: '8px', color: 'var(--steel)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Procurement Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{draftCount}</div>
            <div className="stat-label">Saved Offline Drafts</div>
          </div>
          <div className="stat-item">
            <Archive size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{archivedCount}</div>
            <div className="stat-label">Archived Items</div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="profile-actions">
          <Button
            variant="primary"
            onClick={() => navigate('/edit-profile')}
            className="w-full"
          >
            <Edit2 size={16} /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabbed Sections */}
      <Tabs selectedIndex={selectedIndex} onChange={(index) => {
        setActiveTab(tabKeys[index])
      }}>
        <TabItem label="Overview">
          <div className="profile-section">
            <p className="lede">
              Selamat datang, {profile.username || 'Shooter'}. Gunakan tab di atas untuk melihat
              informasi tentang toko, detail kontak, draft tersimpan, dan item yang diarsipkan.
            </p>
            <div className="overview-links">
              <Button variant="outline" onClick={() => setActiveTab('about')}>
                <Mail size={16} /> Tentang Kami
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('contact')}>
                <Mail size={16} /> Kontak
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('drafts')}>
                <FileText size={16} /> Draft ({draftCount})
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('archived')}>
                <Archive size={16} /> Arsip ({archivedCount})
              </Button>
            </div>
          </div>
        </TabItem>

        <TabItem label="About">
          <AboutSection />
        </TabItem>

        <TabItem label="Contact">
          <ContactSection />
        </TabItem>

        <TabItem label="Drafts">
          <DraftsSection onNavigate={handleNavigate} />
        </TabItem>

        <TabItem label="Arsip">
          <ArchivedSection onNavigate={handleNavigate} />
        </TabItem>
      </Tabs>
    </div>
  )
}