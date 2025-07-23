'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'email' | 'integrations'>('company')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Company settings state
  const [companyData, setCompanyData] = useState({
    name: 'A7 MEDIA',
    orgNumber: '123 456 789',
    email: 'post@a7media.no',
    phone: '+47 900 00 000',
    address: 'Storgata 1, 0123 Oslo',
    website: 'www.a7media.no',
    logo: ''
  })

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    orderCompleted: true,
    orderCancelled: true,
    dailyReminder: false,
    weeklyReport: true
  })

  async function handleCompanySave(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    // Simuler lagring
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Firmainnstillinger oppdatert!' })
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }, 1000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Innstillinger</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'company'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Firmainformasjon
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brukere & Tilganger
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            E-post & Varsler
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integrations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Integrasjoner
          </button>
        </nav>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Firmainformasjon</h2>
          <form onSubmit={handleCompanySave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firmanavn
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organisasjonsnummer
                </label>
                <input
                  type="text"
                  value={companyData.orgNumber}
                  onChange={(e) => setCompanyData({...companyData, orgNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nettside
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Lagrer...' : 'Lagre endringer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users & Access */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Brukere & Tilganger</h2>
          
          <div className="mb-6">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              + Inviter ny bruker
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  AM
                </div>
                <div>
                  <p className="font-medium">Admin Bruker</p>
                  <p className="text-sm text-gray-600">admin@a7media.no</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Admin</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">E-post & Varsler</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">E-postvarsler</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailSettings.orderConfirmation}
                    onChange={(e) => setEmailSettings({...emailSettings, orderConfirmation: e.target.checked})}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Ordrebekreftelse</p>
                    <p className="text-sm text-gray-600">Send bekreftelse når nye ordre opprettes</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailSettings.orderCompleted}
                    onChange={(e) => setEmailSettings({...emailSettings, orderCompleted: e.target.checked})}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Ordre fullført</p>
                    <p className="text-sm text-gray-600">Varsle når ordre er ferdig</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailSettings.dailyReminder}
                    onChange={(e) => setEmailSettings({...emailSettings, dailyReminder: e.target.checked})}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Daglig påminnelse</p>
                    <p className="text-sm text-gray-600">Send påminnelse til fotografer dagen før oppdrag</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailSettings.weeklyReport}
                    onChange={(e) => setEmailSettings({...emailSettings, weeklyReport: e.target.checked})}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Ukentlig rapport</p>
                    <p className="text-sm text-gray-600">Motta sammendrag hver mandag</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-4">E-postmaler</h3>
              <button className="text-indigo-600 hover:text-indigo-700">
                Rediger e-postmaler →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="/tripletex-logo.png" alt="Tripletex" className="h-8 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Tripletex</h3>
                  <p className="text-sm text-gray-600">Regnskapssystem</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Tilkoblet</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Synkroniser kunder, produkter og fakturaer automatisk med Tripletex.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Konfigurer
              </button>
              <button className="px-4 py-2 text-red-600 hover:text-red-700">
                Koble fra
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded mr-4"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-600">Kalendersynkronisering</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Koble til
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Synkroniser oppdrag automatisk med Google Calendar.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded mr-4"></div>
                <div>
                  <h3 className="font-medium text-gray-900">CubiCasa</h3>
                  <p className="text-sm text-gray-600">Plantegninger</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Koble til
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Bestill plantegninger direkte fra IRiS.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded mr-4"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Twilio</h3>
                  <p className="text-sm text-gray-600">SMS-varsler</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Konfigurer
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Send SMS-påminnelser til fotografer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}