'use client'
import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import SelectDropdown from '@/components/shared/SelectDropdown'
import { homeGet } from '@/utils/api'
import { useDecodedToken } from '@/hooks/useDecodedToken'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { successAlert } from '@/utils/alerts'

const page = () => {
  const { userData, isLoading: isTokenLoading } = useDecodedToken()
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState(null)

  // Get company_id and user_id from decoded token
  const companyId = userData?.company_id

  // Webhook URL
  const webhookUrl = companyId 
    ? `https://backend.nrichlearning.com/add-lead-addsense/${companyId}`
    : ''
    
  // Fetch active campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await homeGet('/campaigns/is_active')
        
        if (response?.status && response?.data?.status && response?.data?.data) {
          const campaignOptions = response.data.data.map(campaign => ({
            value: campaign._id,
            label: campaign.campaign_name || 'Unnamed Campaign'
          }))
          setCampaigns(campaignOptions)
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  // Handle campaign selection
  const handleCampaignSelect = (option) => {
    setSelectedCampaign(option)
  }

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      successAlert('Copied to clipboard!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <>
      <PageHeader>
        {/* Header content will be added here */}
      </PageHeader>
      <div className='main-content' style={{ minHeight: '85vh' }}>
        <div className='row'>
          <div className='col-12'>
            <div className='card card-body'>
              <h5 className='card-title mb-4'>Google ADWords Integration</h5>
              
              {/* Campaign Selection Field */}
              <div className='mb-4'>
                <label className='form-label fw-bold mb-2'>
                  Select Campaign <span className='text-danger'>*</span>
                </label>
                <SelectDropdown
                  options={campaigns}
                  selectedOption={selectedCampaign}
                  onSelectOption={handleCampaignSelect}
                  className='w-100'
                />
                {loading && (
                  <small className='text-muted d-block mt-1'>Loading campaigns...</small>
                )}
                {!loading && campaigns.length === 0 && (
                  <small className='text-muted d-block mt-1'>No active campaigns found</small>
                )}
              </div>

              {/* Webhook URL Field */}
              <div className='mb-4'>
                <label className='form-label fw-bold mb-2'>Webhook URL</label>
                <div className='input-group'>
                  <input
                    type='text'
                    className='form-control'
                    value={webhookUrl}
                    disabled
                    readOnly
                    placeholder={isTokenLoading ? 'Loading...' : webhookUrl ? '' : 'No company ID available'}
                  />
                  <button
                    className='btn btn-outline-secondary'
                    type='button'
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    disabled={!webhookUrl || isTokenLoading}
                    title='Copy webhook URL'
                  >
                    {copiedField === 'webhook' ? (
                      <FiCheck size={18} className='text-success' />
                    ) : (
                      <FiCopy size={18} />
                    )}
                  </button>
                </div>
                <small className='text-muted d-block mt-1'>
                  Use this webhook URL in your Google ADWords integration settings
                </small>
              </div>

              {/* Webhook Key Field */}
              <div className='mb-4'>
                <label className='form-label fw-bold mb-2'>Webhook Key</label>
                <div className='input-group'>
                  <input
                    type='text'
                    className='form-control'
                    value={companyId || ''}
                    disabled
                    readOnly
                    placeholder={isTokenLoading ? 'Loading...' : companyId ? '' : 'No company ID available'}
                  />
                  <button
                    className='btn btn-outline-secondary'
                    type='button'
                    onClick={() => copyToClipboard(companyId || '', 'key')}
                    disabled={!companyId || isTokenLoading}
                    title='Copy webhook key'
                  >
                    {copiedField === 'key' ? (
                      <FiCheck size={18} className='text-success' />
                    ) : (
                      <FiCopy size={18} />
                    )}
                  </button>
                </div>
                <small className='text-muted d-block mt-1'>
                  Your unique webhook key for authentication
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page
