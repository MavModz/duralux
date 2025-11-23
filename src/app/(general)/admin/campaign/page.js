import Footer from '@/components/shared/Footer'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets'
import InquiryChannelChart from '@/components/widgetsCharts/InquiryChannelChart'
import InquiryTrackingChart from '@/components/widgetsCharts/InquiryTrackingChart'
import ProjectLeads from '@/components/widgetsList/ProjectLeads'
import ScheduleTwo from '@/components/widgetsList/ScheduleTwo'
import LeadsStatistics from '@/components/widgetsStatistics/LeadsStatistics'
import CampaignTable from '@/components/camapigns/CampaignTable'
import CreateCampaignSidebar from '@/components/camapigns/CreateCampaignSidebar'
import { upcomingEventsData } from '@/utils/fackData/upcomingEventsData'
import React from 'react'

const page = () => {
    return (
        <>
            <PageHeader >
                <PageHeaderWidgets />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <LeadsStatistics />
                    <InquiryTrackingChart />
                    <CampaignTable />
                    <InquiryChannelChart />
                    <ScheduleTwo title={"Upcoming Events"} data={upcomingEventsData.slice(0, 3)} />
                    <ProjectLeads />
                </div>
            </div>
            <Footer />
            <CreateCampaignSidebar />
        </>
    )
}

export default page