import { useState } from 'react'
import { ArrowLeft, Camera, Save, Loader, CheckCircle, AlertCircle, X } from 'lucide-react'
import userService from '../services/userService'
import { Button, Input, Textarea } from '../components/ui'
import { useNavigate } from 'react-router-dom'

/**
 * EditProfilePage — Edit username, bio, and avatar in a dedicated page.
 */
export default function EditProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar image must be under 2MB.')
      setTimeout(() => setError(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatarPreview(base64)
      setAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setAvatar(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      setSaving(true)
      const updated = {
        ...profile,
        username: username.trim() || 'Shooter',
        bio: bio.trim(),
        avatar,
      }
      const result = userService.saveUserProfile(updated)
      if (result.success) {
        setProfile(result.data)
        setSuccess('Profile successfully updated.')
        setTimeout(() => { setSuccess(''); navigate('/profile') }, 1500)
      } else {
        setError('Failed to save profile.')
      }
    } catch {
      setError('An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-page">
      {/* Header */}
      <div className="form-head">
        <button type="button" className="detail-back" onClick={() => navigate('/profile')}>
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </div>

      <div className="form-title-group">
        <h1 className="display">Edit Profile</h1>
        <p className="lede">Update your callsign, armory notes, and avatar.</p>
      </div>

      {error && (
        <div className="toast toast--error">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="toast toast--success">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="entry-form">
        {/* Avatar Section */}
        <div className="card-box">
          <h2 className="card-box-title">Avatar</h2>
          <div className="avatar-edit-wrap">
            <div className="avatar-preview-large">
              {avatarPreview ? (
                <img src={avatarPreview} alt={username} />
              ) : (
                <div className="avatar-placeholder-large">
                  <span>{username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="avatar-controls">
              <label className="btn btn--outline btn--sm">
                <Camera size={14} /> Upload New Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden-file-input"
                />
              </label>
              {avatarPreview && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAvatar}>
                  <X size={14} /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Input
          label="Callsign / Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Operator Delta, Master Gunsmith"
          required
          maxLength={50}
        />

        <Textarea
          label="Armory Notes / Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Qualifications, preferred calibers, unit assignment..."
          rows={4}
          maxLength={500}
        />

        {/* Submit bar */}
        <div className="form-actions-bar">
          <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <>
                <Loader size={18} className="spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}