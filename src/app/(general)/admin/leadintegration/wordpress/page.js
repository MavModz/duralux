'use client'
import React, { useState, useEffect, useRef } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import WordpressIntegrationTable from '@/components/LeadIntegration/WordpressIntegrationTable'
import { homeGet, homePatch } from '@/utils/api'
import { successAlert, errorAlert } from '@/utils/alerts'

const page = () => {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const createNewRef = useRef(null)

  // Fetch WordPress integrations data
  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await homeGet('/wordpress-automation')
      
      if (response?.status && response?.data?.status && Array.isArray(response?.data?.data)) {
        // Map API response to match table structure
        const mappedData = response.data.data.map(item => ({
          _id: item._id,
          title: item.title,
          campaign_name: item.campaign?.campaign_name || 'N/A',
          campaign_id: item.campaign?._id,
          campaign: item.campaign, // Keep full campaign object for reference
          connected: item.connected,
          created_by: item.created_by || {},
          created_at: item.createdAt,
          active: item.active
        }))
        setIntegrations(mappedData)
      } else {
        setIntegrations([])
      }
    } catch (error) {
      console.error('Error fetching WordPress integrations:', error)
      setIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  // Handle new integration created - refetch data to get accurate server state
  const handleDataChange = async () => {
    // Refetch all integrations to get the latest data from server
    await fetchIntegrations()
  }

  // Handle toggle change
  const handleToggleChange = async (integrationId, newActiveState) => {
    try {
      const response = await homePatch(`/wordpress-edit/${integrationId}`, {
        active: newActiveState
      })

      if (response?.status && response?.data?.status) {
        // Update local state
        setIntegrations(prevIntegrations =>
          prevIntegrations.map(item =>
            item._id === integrationId
              ? { ...item, active: newActiveState }
              : item
          )
        )
        successAlert(`Integration ${newActiveState ? 'activated' : 'paused'} successfully`)
      } else {
        errorAlert(response?.data?.msg || 'Failed to update integration status')
        throw new Error(response?.data?.msg || 'Failed to update integration status')
      }
    } catch (error) {
      console.error('Error updating integration status:', error)
      throw error
    }
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (createNewRef.current) {
                createNewRef.current()
              }
            }}
          >
            Generate New Link
          </button>
        </div>
      </PageHeader>
      <div className='main-content' style={{ minHeight: '85vh' }}>
        <div className='row'>
          <WordpressIntegrationTable 
            title="WordPress Integrations" 
            data={integrations}
            loading={loading}
            onToggleChange={handleToggleChange}
            onCreateNew={createNewRef}
            onDataChange={handleDataChange}
          />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page

