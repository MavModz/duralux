'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import LeadsViewHeader from '@/components/leadsViewCreate/LeadsViewHeader'
import LeadsViewContent from '@/components/leadsViewCreate/LeadsViewContent'
import LeadsViewTab from '@/components/leadsViewCreate/LeadsViewTab'
import { homeGet } from '@/utils/api'

const LeadViewContent = () => {
  const params = useParams()
  const leadId = params?.id
  const [leadData, setLeadData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!leadId) {
        setError('Lead ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await homeGet(`/leads/${leadId}`)
        
        if (response?.status && response?.data?.status && response?.data?.data) {
          setLeadData(response.data.data)
        } else {
          setError(response?.data?.message || 'Failed to fetch lead details')
          console.error('API Error:', response)
        }
      } catch (err) {
        console.error('Error fetching lead details:', err)
        setError('An error occurred while fetching lead details')
      } finally {
        setLoading(false)
      }
    }

    fetchLeadDetails()
  }, [leadId])

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading lead details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!leadData) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        No lead data found.
      </div>
    )
  }

  return (
    <>
      <PageHeader>
        <LeadsViewHeader leadData={leadData} />
      </PageHeader>
      <LeadsViewTab leadData={leadData} />
      <div className='main-content'>
        <div className='tab-content'>
          <LeadsViewContent leadData={leadData} />
        </div>
      </div>
    </>
  )
}

const page = () => {
  return (
    <Suspense fallback={
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </div>
    }>
      <LeadViewContent />
    </Suspense>
  )
}

export default page

