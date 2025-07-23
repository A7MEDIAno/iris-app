'use client'

import { useState } from 'react'
import { showToast } from '../../../components/ui/Toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [isSaving, setIsSaving] = useState(false)
  
  // Midlertidig state for forms
  const [companyData, setCompanyData] = useState({
    name: 'A7 MEDIA AS',
    orgNumber: '123456789',
    address: 'Storgata 1',
    postalCode: '0123',
    city: 'Oslo',
    phone: '+47 123 45 678',
    email: 'post@a7media.no',
    website: 'www.a7media.no'
  })

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    orderCompleted: true,
    invoiceCreated: true,
    weeklyReport: false,
    monthlyReport: true
  })

  const [integrations, setIntegrations] = useState({
    cubicasa: { enabled: false, apiKey: '' },
    poweroffice: { enabled: false, clientId: '', clientSecret: '' },
    tripletex: { enabled: false, employeeToken: '', sessionToken: '' }
  })

  async function handleSave() {
    setIsSaving(true)
    // Simuler lagring
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Vis toast eller melding om suksess
  }

  const tabs = [
    { id: 'company', label: 'Firmainformasjon', icon: '🏢' },
    { id: 'users', label: 'Brukere', icon: '👥' },
    { id: 'email', label: 'E-postvarsler', icon: '📧' },
    { id: 'integrations', label: 'Integrasjoner', icon: '🔌' },
    { id: 'billing', label: 'Fakturering', icon: '💳' },
    { id: 'api', label: 'API & Webhooks', icon: '🔧' }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Innstillinger</h1>
        <p className="text-gray-400 mt-1">Konfigurer systemet og integrasjoner</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar med tabs */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-nordvik-900 text-white' 
                    : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Innholdsområde */}
        <div className="flex-1">
          <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
            {/* Firmainformasjon */}
            {activeTab === 'company' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Firmainformasjon</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Firmanavn
                    </label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Organisasjonsnummer
                    </label>
                    <input
                      type="text"
                      value={companyData.orgNumber}
                      onChange={(e) => setCompanyData({...companyData, orgNumber: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Postnummer
                    </label>
                    <input
                      type="text"
                      value={companyData.postalCode}
                      onChange={(e) => setCompanyData({...companyData, postalCode: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Poststed
                    </label>
                    <input
                      type="text"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      E-post
                    </label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nettside
                    </label>
                    <input
                      type="url"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dark-800">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Logo</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-dark-800 rounded-lg flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <button className="btn-primary mb-2">Last opp logo</button>
                      <p className="text-sm text-gray-500">PNG, JPG eller SVG. Maks 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Brukere */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-200">Brukere</h2>
                  <button className="btn-primary">Inviter bruker</button>
                </div>

                <div className="space-y-4">
                  <div className="bg-dark-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-nordvik-800 rounded-full flex items-center justify-center text-white font-semibold">
                        ML
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">Mats Lønne</p>
                        <p className="text-sm text-gray-500">mats@a7media.no</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="status-badge bg-green-900/20 text-green-400 border border-green-800">
                        Administrator
                      </span>
                      <button className="text-gray-400 hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* E-postvarsler */}
            {activeTab === 'email' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-200 mb-6">E-postvarsler</h2>
                
                <div className="space-y-6">
                  {/* Test Email Section */}
                  <div className="bg-dark-800 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-200 mb-4">Test E-poster</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Send test-versjoner av system e-poster for å sjekke at alt fungerer.
                    </p>
                    
                    <div className="flex gap-4">
                      <select 
                        id="emailType"
                        className="input-field flex-1"
                        defaultValue="order-confirmation"
                      >
                        <option value="order-confirmation">Ordrebekreftelse</option>
                        <option value="order-completed">Ordre fullført</option>
                      </select>
                      
                      <button
                        onClick={async () => {
                          const emailType = (document.getElementById('emailType') as HTMLSelectElement).value
                          
                          try {
                            const res = await fetch('/api/test-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ type: emailType })
                            })
                            
                            const data = await res.json()
                            
                            if (res.ok) {
                              showToast({
                                type: 'success',
                                title: 'Test e-post sendt',
                                message: data.message
                              })
                            } else {
                              throw new Error(data.error)
                            }
                          } catch (error: any) {
                            showToast({
                              type: 'error',
                              title: 'Kunne ikke sende test e-post',
                              message: error.message
                            })
                          }
                        }}
                        className="btn-secondary"
                      >
                        Send test
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">Ordrebekreftelse</p>
                      <p className="text-sm text-gray-500">Send e-post når ny ordre opprettes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailSettings.orderConfirmation}
                        onChange={(e) => setEmailSettings({...emailSettings, orderConfirmation: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">Ordre fullført</p>
                      <p className="text-sm text-gray-500">Send e-post når ordre er levert</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailSettings.orderCompleted}
                        onChange={(e) => setEmailSettings({...emailSettings, orderCompleted: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">Faktura opprettet</p>
                      <p className="text-sm text-gray-500">Send e-post når faktura genereres</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailSettings.invoiceCreated}
                        onChange={(e) => setEmailSettings({...emailSettings, invoiceCreated: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                    </label>
                  </div>

                  <div className="pt-6 border-t border-dark-800">
                    <h3 className="font-medium text-gray-200 mb-4">Rapporter</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-200">Ukentlig rapport</p>
                          <p className="text-sm text-gray-500">Oppsummering hver mandag</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={emailSettings.weeklyReport}
                            onChange={(e) => setEmailSettings({...emailSettings, weeklyReport: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-200">Månedlig rapport</p>
                          <p className="text-sm text-gray-500">Detaljert rapport hver måned</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={emailSettings.monthlyReport}
                            onChange={(e) => setEmailSettings({...emailSettings, monthlyReport: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrasjoner */}
            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Integrasjoner</h2>
                
                <div className="space-y-6">
                  {/* CubiCasa */}
                  <div className="bg-dark-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🏠</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-200">CubiCasa</h3>
                          <p className="text-sm text-gray-500">Automatisk generering av plantegninger</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={integrations.cubicasa.enabled}
                          onChange={(e) => setIntegrations({
                            ...integrations,
                            cubicasa: {...integrations.cubicasa, enabled: e.target.checked}
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                      </label>
                    </div>
                    
                    {integrations.cubicasa.enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          API Nøkkel
                        </label>
                        <input
                          type="password"
                          value={integrations.cubicasa.apiKey}
                          onChange={(e) => setIntegrations({
                            ...integrations,
                            cubicasa: {...integrations.cubicasa, apiKey: e.target.value}
                          })}
                          placeholder="Din CubiCasa API nøkkel"
                          className="input-field w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* PowerOffice */}
                  <div className="bg-dark-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">💼</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-200">PowerOffice</h3>
                          <p className="text-sm text-gray-500">Synkroniser faktura og regnskap</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={integrations.poweroffice.enabled}
                          onChange={(e) => setIntegrations({
                            ...integrations,
                            poweroffice: {...integrations.poweroffice, enabled: e.target.checked}
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Tripletex */}
                  <div className="bg-dark-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-200">Tripletex</h3>
                          <p className="text-sm text-gray-500">Alternativ til PowerOffice</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={integrations.tripletex.enabled}
                          onChange={(e) => setIntegrations({
                            ...integrations,
                            tripletex: {...integrations.tripletex, enabled: e.target.checked}
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordvik-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lagre-knapp */}
            <div className="mt-8 pt-6 border-t border-dark-800 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Lagrer...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lagre endringer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}