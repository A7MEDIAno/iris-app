'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/ui/Toast'
import { User, Mail, Phone, Briefcase, Calendar, Camera, Save } from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  profileImage?: string
  bio?: string
  role: string
  googleCalendarId?: string
  calendarSyncEnabled: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLinkingCalendar, setIsLinkingCalendar] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    bio: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load profile')
      
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        title: data.title || '',
        phone: data.phone || '',
        email: data.email || '',
        bio: data.bio || ''
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke laste profil',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Failed to update profile')
      
      const updated = await res.json()
      setProfile(updated)
      
      showToast({
        type: 'success',
        title: 'Profil oppdatert',
        message: 'Endringene er lagret'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke oppdatere profil',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Her kan du implementere bildeopplasting til Vercel Blob eller annen tjeneste
    showToast({
      type: 'info',
      title: 'Kommer snart',
      message: 'Profilbilde-opplasting implementeres snart'
    })
  }

  async function linkGoogleCalendar() {
    setIsLinkingCalendar(true)
    try {
      const res = await fetch('/api/auth/google/calendar')
      if (!res.ok) throw new Error('Failed to get auth URL')
      
      const { authUrl } = await res.json()
      window.location.href = authUrl
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke koble til Google Calendar',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLinkingCalendar(false)
    }
  }

  async function unlinkGoogleCalendar() {
    try {
      const res = await fetch('/api/auth/google/calendar', {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to unlink')
      
      await loadProfile()
      
      showToast({
        type: 'success',
        title: 'Google Calendar frakoblet',
        message: 'Kalenderen er ikke lenger synkronisert'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke koble fra',
        message: 'Prøv igjen senere'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Profil</h1>
        <p className="text-gray-400 mt-1">Administrer din profil og innstillinger</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Venstre kolonne - Profilbilde */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <div className="text-center">
              {/* Profilbilde */}
              <div className="relative inline-block">
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-nordvik-800 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                
                {/* Endre bilde knapp */}
                <label className="absolute bottom-0 right-0 bg-nordvik-500 text-white p-2 rounded-full cursor-pointer hover:bg-nordvik-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-100 mt-4">{formData.name}</h2>
              <p className="text-gray-400">{formData.title || profile?.role}</p>
            </div>
          </div>

          {/* Google Calendar */}
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-nordvik-400" />
              Google Calendar
            </h3>
            
            {profile?.calendarSyncEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Kalenderen din er koblet til
                </p>
                <p className="text-sm text-gray-300 font-mono bg-dark-800 p-2 rounded break-all">
                  {profile.googleCalendarId}
                </p>
                <button
                  onClick={unlinkGoogleCalendar}
                  className="btn-secondary w-full"
                >
                  Koble fra kalender
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Koble til Google Calendar for å synkronisere din tilgjengelighet
                </p>
                <button
                  onClick={linkGoogleCalendar}
                  disabled={isLinkingCalendar}
                  className="btn-primary w-full"
                >
                  {isLinkingCalendar ? 'Kobler til...' : 'Koble til Google Calendar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Høyre kolonne - Informasjon */}
        <div className="lg:col-span-2">
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-6">Informasjon om deg selv</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Navn
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field w-full"
                    placeholder="F.eks. Fotograf | Dronepiolt"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-post
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    disabled // E-post kan vanligvis ikke endres
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="400 00 000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio / Beskrivelse
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Fortell litt om deg selv og din erfaring..."
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}