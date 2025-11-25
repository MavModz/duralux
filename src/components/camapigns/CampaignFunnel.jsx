'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { campaignFunnelChartOptions } from '@/utils/chartsLogic/campaignFunnelChartOptions'
import { homeGet } from '@/utils/api'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })


const CampaignFunnel = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [funnelData, setFunnelData] = useState({
        'Open Lead': 0,
        'In Progress': 0,
        'Hot Lead': 0,
        'Converted Lead': 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFunnelData()
    }, [refreshKey])

    const fetchFunnelData = async () => {
        try {
            setLoading(true)
            const response = await homeGet('/campaign-funnel-data')
            
            if (response?.status && response?.data?.status && response?.data?.data) {
                setFunnelData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching funnel data:', error)
        } finally {
            setLoading(false)
        }
    }

    const chartOptions = campaignFunnelChartOptions(funnelData)

    if (isRemoved) {
        return null;
    }

    if (loading) {
        return (
            <div className="col-xxl-6">
                <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                    <CardHeader title={"Campaign Funnel"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                    <div className="card-body custom-card-action p-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <CardLoader refreshKey={refreshKey} />
                </div>
            </div>
        )
    }

    return (
        <div className="col-xxl-6">
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Campaign Funnel"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action p-0">
                    <ReactApexChart
                        type='bar'
                        options={chartOptions}
                        series={chartOptions.series}
                        height={400}
                    />
                </div>

                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default CampaignFunnel
