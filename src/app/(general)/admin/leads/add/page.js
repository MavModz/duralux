'use client'
import React, { useRef } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import LeadsCreateHeader from '@/components/leadsViewCreate/LeadsCreateHeader'
import LeadsCreateContent from '@/components/leadsViewCreate/LeadsCreateContent'

const page = () => {
  const leadsContentRef = useRef(null);

  const handleCreateLead = () => {
    if (leadsContentRef.current) {
      leadsContentRef.current.handleSubmit();
    }
  };

  return (
    <>
      <PageHeader>
        <LeadsCreateHeader onCreateLead={handleCreateLead} />
      </PageHeader>

      <div className='main-content'>
        <div className='row'>
          <LeadsCreateContent ref={leadsContentRef} />
        </div>
      </div>
    </>
  )
}

export default page