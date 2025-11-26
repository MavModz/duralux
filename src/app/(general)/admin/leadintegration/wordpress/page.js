import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'

const page = () => {
  return (
    <>
      <PageHeader>
        {/* Header content will be added here */}
      </PageHeader>
      <div className='main-content' style={{ minHeight: '85vh' }}>
        <div className='row'>
          {/* Components will be added here */}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page

