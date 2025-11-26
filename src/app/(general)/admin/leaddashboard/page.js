import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import DashboardStatsOverview from '@/components/dashboard/dashboardStatsOverview'
import LeadsRecordChart from '@/components/dashboard/LeadsRecordChart'
import CrmIntegration from '@/components/dashboard/CrmIntegration'
import UpcomingSchedule from '@/components/dashboard/UpcomingSchedule'
import CrmLeads from '@/components/dashboard/CrmLeads'

const page = () => {
  return (
    <>
      <PageHeader >
        <PageHeaderDate />
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <DashboardStatsOverview />
          <LeadsRecordChart />
          <CrmIntegration cardYSpaceClass="hrozintioal-card" borderShow={true} title="CRM Integration" />
          <UpcomingSchedule title={"Upcoming Follow-Ups"} />
          <CrmLeads title={"CRM Leads"} />
        </div>
      </div>
    </>
  )
}

export default page