'use client'
import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import SelectDropdown from '@/components/shared/SelectDropdown'
import { homeGet, homePut } from '@/utils/api'
import { useDecodedToken } from '@/hooks/useDecodedToken'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { successAlert, errorAlert } from '@/utils/alerts'
import Swal from 'sweetalert2'

const page = () => {
  const { userData, isLoading: isTokenLoading } = useDecodedToken()
  const [campaigns, setCampaigns] = useState([])
  const [currentCampaign, setCurrentCampaign] = useState(null) // Current campaign from company settings
  const [currentCampaignName, setCurrentCampaignName] = useState('')
  const [selectedCampaignInModal, setSelectedCampaignInModal] = useState(null) // Selected in modal
  const [loading, setLoading] = useState(true)
  const [loadingCompanySettings, setLoadingCompanySettings] = useState(true)
  const [copiedField, setCopiedField] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [googleAdwardsActive, setGoogleAdwardsActive] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Get company_id and user_id from decoded token
  const companyId = userData?.company_id

  // Webhook URL
  const webhookUrl = companyId 
    ? `https://backend.nrichlearning.com/add-lead-addsense/${companyId}`
    : ''
    
  // Fetch company settings to get current campaign
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        setLoadingCompanySettings(true)
        const response = await homeGet('/company-settings')
        
        if (response?.status && response?.data?.status && response?.data?.data) {
          const companyData = response.data.data
          const googleAdwardsCampaign = companyData?.googleAdwards_campaign_id
          
          // Set toggle state
          setGoogleAdwardsActive(companyData?.googleAdwards_active || false)
          
          if (googleAdwardsCampaign) {
            setCurrentCampaign(googleAdwardsCampaign._id)
            setCurrentCampaignName(googleAdwardsCampaign.campaign_name || 'No campaign selected')
          } else {
            setCurrentCampaign(null)
            setCurrentCampaignName('No campaign selected')
          }
        }
      } catch (error) {
        console.error('Error fetching company settings:', error)
        setCurrentCampaignName('Error loading campaign')
      } finally {
        setLoadingCompanySettings(false)
      }
    }

    if (!isTokenLoading) {
      fetchCompanySettings()
    }
  }, [isTokenLoading])

  // Fetch active campaigns for modal dropdown
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

  // Auto-open modal if no campaign is selected and campaigns are loaded
  useEffect(() => {
    if (!loadingCompanySettings && !loading && currentCampaign === null && campaigns.length > 0 && !showEditModal) {
      setShowEditModal(true)
    }
  }, [loadingCompanySettings, loading, currentCampaign, campaigns.length, showEditModal])

  // Handle opening edit modal - set initial selected campaign
  const handleOpenEditModal = () => {
    // Set the current campaign as selected in modal
    if (currentCampaign) {
      const currentCampaignOption = campaigns.find(c => c.value === currentCampaign)
      setSelectedCampaignInModal(currentCampaignOption || null)
    } else {
      setSelectedCampaignInModal(null)
    }
    setShowEditModal(true)
  }

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedCampaignInModal(null)
  }

  // Handle campaign selection in modal
  const handleCampaignSelectInModal = (option) => {
    setSelectedCampaignInModal(option)
  }

  // Handle save campaign
  const handleSaveCampaign = async () => {
    if (!selectedCampaignInModal) {
      errorAlert('Please select a campaign')
      return
    }

    // Check if campaign has changed
    if (selectedCampaignInModal.value === currentCampaign) {
      // Same campaign selected, just close modal
      handleCloseEditModal()
      return
    }

    try {
      setSaving(true)
      const response = await homePut('/setting-update', {
        googleAdwards_campaign_id: selectedCampaignInModal.value
      })

      if (response?.status && response?.data?.status) {
        successAlert('Campaign updated successfully')
        // Update current campaign
        setCurrentCampaign(selectedCampaignInModal.value)
        setCurrentCampaignName(selectedCampaignInModal.label)
        handleCloseEditModal()
      } else {
        errorAlert(response?.data?.msg || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('Error updating campaign:', error)
      errorAlert('An error occurred while updating campaign')
    } finally {
      setSaving(false)
    }
  }

  // Handle toggle change
  const handleToggleChange = async (e) => {
    const newValue = e.target.checked
    const action = newValue ? 'enable' : 'disable'
    
    // Show warning modal
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `
        <div style="text-align: left; padding: 1rem 0;">
          <p style="margin-bottom: 1rem; font-size: 1rem;">
            You are about to <strong>${action}</strong> the Google ADWords integration.
          </p>
          <p style="margin-bottom: 0; color: #6c757d; font-size: 0.875rem;">
            ${newValue 
              ? 'This will activate the integration and start receiving leads from Google ADWords campaigns.' 
              : 'This will deactivate the integration and stop receiving leads from Google ADWords campaigns.'}
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#ffc107',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-warning m-1',
        cancelButton: 'btn btn-secondary m-1'
      },
      buttonsStyling: false
    })

    // If user cancels, don't update state (toggle will remain in original position)
    if (!result.isConfirmed) {
      return
    }

    // User confirmed, proceed with API call
    // Optimistically update UI
    setGoogleAdwardsActive(newValue)
    
    try {
      setToggling(true)
      const response = await homePut('/setting-update', {
        googleAdwards_active: newValue
      })

      if (response?.status && response?.data?.status) {
        successAlert(`Google ADWords integration ${newValue ? 'enabled' : 'disabled'} successfully`)
      } else {
        // Revert toggle on error
        setGoogleAdwardsActive(!newValue)
        errorAlert(response?.data?.msg || 'Failed to update integration status')
      }
    } catch (error) {
      console.error('Error updating toggle:', error)
      // Revert toggle on error
      setGoogleAdwardsActive(!newValue)
      errorAlert('An error occurred while updating integration status')
    } finally {
      setToggling(false)
    }
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
              <div className='d-flex align-items-center justify-content-between mb-4'>
                <h5 className='card-title mb-0'>Google ADWords Integration</h5>
                <div className='form-check form-switch form-switch-sm'>
                  <input
                    className='form-check-input c-pointer'
                    type='checkbox'
                    id='googleAdwardsToggle'
                    checked={googleAdwardsActive}
                    onChange={handleToggleChange}
                    disabled={toggling || loadingCompanySettings}
                  />
                </div>
              </div>
              
              {/* Campaign Selection Field */}
              <div className='mb-4'>
                <label className='form-label fw-bold mb-2'>
                  Select Campaign <span className='text-danger'>*</span>
                </label>
                <div className='input-group'>
                  <input
                    type='text'
                    className='form-control'
                    value={loadingCompanySettings ? 'Loading...' : currentCampaignName}
                    disabled
                    readOnly
                    placeholder={loadingCompanySettings ? 'Loading...' : 'No campaign selected'}
                  />
                  <button
                    className='btn btn-primary'
                    type='button'
                    onClick={handleOpenEditModal}
                    disabled={loadingCompanySettings}
                  >
                    Edit Campaign
                  </button>
                </div>
                {loadingCompanySettings && (
                  <small className='text-muted d-block mt-1'>Loading campaign...</small>
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

      {/* Edit Campaign Modal */}
      {showEditModal && (
        <>
          <div
            className="modal fade show"
            id="editCampaignModal"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="editCampaignModalLabel"
            aria-hidden={false}
            style={{ display: 'block' }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title" id="editCampaignModalLabel">
                    Edit Campaign
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseEditModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold mb-2">
                      Select Campaign <span className="text-danger">*</span>
                    </label>
                    <SelectDropdown
                      options={campaigns}
                      selectedOption={selectedCampaignInModal}
                      onSelectOption={handleCampaignSelectInModal}
                      className="w-100"
                    />
                    {loading && (
                      <small className="text-muted d-block mt-1">Loading campaigns...</small>
                    )}
                    {!loading && campaigns.length === 0 && (
                      <small className="text-muted d-block mt-1">No active campaigns found</small>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseEditModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveCampaign}
                    disabled={saving || !selectedCampaignInModal}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseEditModal}
          />
        </>
      )}
    </>
  )
}

export default page
