'use client'
import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import LeadsHeader from '@/components/leads/LeadsHeader'
import LeadssTable from '@/components/leads/LeadsTable'
import Footer from '@/components/shared/Footer'
import { homePost } from '@/utils/api'

const page = () => {
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [followUpCount, setFollowUpCount] = useState(0);
    const [incompleteCount, setIncompleteCount] = useState(0);
    const [leadsData, setLeadsData] = useState([]);

    // Fetch counts for Follow Up and Incomplete leads
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch Follow Up count using /view-followup API (POST)
                const followUpPayload = {
                    page: 1,
                    limit: 1, // Just need count, so minimal limit
                    filter: {}
                };
                const followUpResponse = await homePost('/view-followup', followUpPayload);
                if (followUpResponse?.status && followUpResponse?.data?.status !== false) {
                    // Get total count from response
                    const count = followUpResponse?.data?.total || followUpResponse?.data?.data?.length || 0;
                    setFollowUpCount(count);
                }

                // Fetch Incomplete count
                const incompletePayload = {
                    filter: {
                        customer_type: "lead",
                        lead_status: "Incomplete"
                    },
                    limit: 10000, // High limit to get all matching leads for count
                    skip: 0
                };
                const incompleteResponse = await homePost('/all-leads', incompletePayload);
                if (incompleteResponse?.status && incompleteResponse?.data?.status && incompleteResponse?.data?.data) {
                    // Get total count from response if available, otherwise use data array length
                    const count = incompleteResponse?.data?.total || incompleteResponse?.data?.count || incompleteResponse?.data?.data?.length || 0;
                    setIncompleteCount(count);
                }
            } catch (err) {
                console.error('Error fetching lead counts:', err);
            }
        };

        fetchCounts();
    }, []);

    const handleSelectionChange = (leadIds) => {
        setSelectedLeadIds(leadIds);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleLeadsDataChange = (data) => {
        setLeadsData(data);
    };

    return (
        <>
            <PageHeader>
                <LeadsHeader 
                    selectedLeadIds={selectedLeadIds} 
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    followUpCount={followUpCount}
                    incompleteCount={incompleteCount}
                    leadsData={leadsData}
                />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <LeadssTable 
                        onSelectionChange={handleSelectionChange}
                        activeTab={activeTab}
                        onLeadsDataChange={handleLeadsDataChange}
                    />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default page