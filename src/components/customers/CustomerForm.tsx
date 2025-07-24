import { useState, useEffect } from 'react'
import { User, Building, Mail, Phone, FileText, Users, AlertCircle } from 'lucide-react'

interface CustomerFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface ContactPerson {
  id?: string
  name: string
  email: string
  phone: string
  role: string
  isPrimary: boolean
}

export default function CustomerForm({ initialData, onSubmit, onCancel, isLoading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orgNumber: '',
    invoiceEmail: '',
    invoiceAddress: '',
    invoiceZip: '',
    invoiceCity: '',
    deliveryAddress: '',
    deliveryZip: '',
    deliveryCity: '',
    paymentTerms: 14,
    creditLimit: 0,
    notes: '',
    ...initialData
  })

  const [contactPersons, setContactPersons] = useState<ContactPerson[]>(
    initialData?.contactPersons || [{ name: '', email: '', phone: '', role: '', isPrimary: true }]
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false)
  const [validatingOrgNumber, setValidatingOrgNumber] = useState(false)

  // Valider organisasjonsnummer
  const validateOrgNumber = async (orgNumber: string) => {
    if (!orgNumber) return
    
    setValidatingOrgNumber(true)
    try {
      // Simuler API-kall til Brreg
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!/^\d{9}$/.test(orgNumber.replace(/\s/g, ''))) {
        setErrors(prev => ({ ...prev, orgNumber: 'Ugyldig organisasjonsnummer' }))
      } else {
        setErrors(prev => ({ ...prev, orgNumber: '' }))
      }
    } finally {
      setValidatingOrgNumber(false)
    }
  }

  // Håndter form submit
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}

    // Validering
    if (!formData.name) newErrors.name = 'Navn er påkrevd'
    if (!formData.email) newErrors.email = 'E-post er påkrevd'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse'
    }

    // Valider kontaktpersoner
    contactPersons.forEach((contact, index) => {
      if (contact.name && !contact.email) {
        newErrors[`contact_${index}_email`] = 'E-post er påkrevd for kontaktperson'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Send data
    await onSubmit({
      ...formData,
      contactPersons: contactPersons.filter(c => c.name || c.email)
    })
  }

  // Legg til kontaktperson
  const addContactPerson = () => {
    setContactPersons([...contactPersons, { 
      name: '', 
      email: '', 
      phone: '', 
      role: '', 
      isPrimary: false 
    }])
  }

  // Fjern kontaktperson
  const removeContactPerson = (index: number) => {
    setContactPersons(contactPersons.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Grunnleggende informasjon */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <Building className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Grunnleggende informasjon</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Firmanavn *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nordvik & Partners"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organisasjonsnummer
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.orgNumber}
                onChange={(e) => setFormData({ ...formData, orgNumber: e.target.value })}
                onBlur={() => validateOrgNumber(formData.orgNumber)}
                className={`input-field w-full ${errors.orgNumber ? 'border-red-500' : ''}`}
                placeholder="123 456 789"
              />
              {validatingOrgNumber && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin h-4 w-4 border-2 border-nordvik-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            {errors.orgNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.orgNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-post *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="post@firma.no"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field w-full"
              placeholder="+47 123 45 678"
            />
          </div>
        </div>
      </div>

      {/* Kontaktpersoner */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-nordvik-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-100">Kontaktpersoner</h3>
          </div>
          <button
            type="button"
            onClick={addContactPerson}
            className="text-sm text-nordvik-400 hover:text-nordvik-300"
          >
            + Legg til kontaktperson
          </button>
        </div>

        <div className="space-y-4">
          {contactPersons.map((contact, index) => (
            <div key={index} className="p-4 bg-dark-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Navn
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...contactPersons]
                      updated[index].name = e.target.value
                      setContactPersons(updated)
                    }}
                    className="input-field w-full"
                    placeholder="Ola Nordmann"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-post
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => {
                      const updated = [...contactPersons]
                      updated[index].email = e.target.value
                      setContactPersons(updated)
                    }}
                    className={`input-field w-full ${errors[`contact_${index}_email`] ? 'border-red-500' : ''}`}
                    placeholder="ola@firma.no"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => {
                      const updated = [...contactPersons]
                      updated[index].phone = e.target.value
                      setContactPersons(updated)
                    }}
                    className="input-field w-full"
                    placeholder="+47 123 45 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rolle
                  </label>
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) => {
                      const updated = [...contactPersons]
                      updated[index].role = e.target.value
                      setContactPersons(updated)
                    }}
                    className="input-field w-full"
                    placeholder="Markedsansvarlig"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary}
                    onChange={(e) => {
                      const updated = contactPersons.map((c, i) => ({
                        ...c,
                        isPrimary: i === index ? e.target.checked : false
                      }))
                      setContactPersons(updated)
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-400">Primærkontakt</span>
                </label>

                {contactPersons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContactPerson(index)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Fjern
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fakturering */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Fakturering</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Faktura e-post
            </label>
            <input
              type="email"
              value={formData.invoiceEmail}
              onChange={(e) => setFormData({ ...formData, invoiceEmail: e.target.value })}
              className="input-field w-full"
              placeholder={formData.email || 'faktura@firma.no'}
            />
            <p className="mt-1 text-sm text-gray-500">
              La stå tom for å bruke hovedepost
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fakturaadresse
            </label>
            <input
              type="text"
              value={formData.invoiceAddress}
              onChange={(e) => setFormData({ ...formData, invoiceAddress: e.target.value })}
              className="input-field w-full"
              placeholder="Storgata 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Postnummer
            </label>
            <input
              type="text"
              value={formData.invoiceZip}
              onChange={(e) => setFormData({ ...formData, invoiceZip: e.target.value })}
              className="input-field w-full"
              placeholder="0123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Poststed
            </label>
            <input
              type="text"
              value={formData.invoiceCity}
              onChange={(e) => setFormData({ ...formData, invoiceCity: e.target.value })}
              className="input-field w-full"
              placeholder="Oslo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Betalingsbetingelser (dager)
            </label>
            <input
              type="number"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) || 14 })}
              className="input-field w-full"
              min="0"
              max="90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kredittgrense
            </label>
            <input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
              className="input-field w-full"
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDeliveryAddress}
              onChange={(e) => setShowDeliveryAddress(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">Annen leveringsadresse</span>
          </label>
        </div>

        {showDeliveryAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-dark-800 rounded-lg">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leveringsadresse
              </label>
              <input
                type="text"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Postnummer
              </label>
              <input
                type="text"
                value={formData.deliveryZip}
                onChange={(e) => setFormData({ ...formData, deliveryZip: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poststed
              </label>
              <input
                type="text"
                value={formData.deliveryCity}
                onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notater */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Interne notater</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="input-field w-full"
          placeholder="Spesielle instruksjoner, preferanser, etc..."
        />
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-dark-950 py-4 border-t border-dark-800">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Lagrer...' : (initialData ? 'Oppdater kunde' : 'Opprett kunde')}
        </button>
      </div>
    </div>
  )
}