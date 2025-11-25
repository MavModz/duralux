'use client'
import React, { useState, useEffect } from 'react'
import { FiArrowDownCircle, FiArrowUpCircle, FiMinusCircle } from 'react-icons/fi'
import { homePost } from '@/utils/api'

const CampaignStats = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [campaignId, setCampaignId] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        if (campaignId) {
            fetchStats(campaignId)
        }
    }, [campaignId])

    // Listen for view funnel event from CampaignTable
    useEffect(() => {
        const handleViewFunnel = (event) => {
            const campaignId = event.detail?.campaignId
            if (campaignId) {
                setCampaignId(campaignId)
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('view-campaign-funnel', handleViewFunnel)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('view-campaign-funnel', handleViewFunnel)
            }
        }
    }, [])

    const fetchStats = async (campaignIdParam = null) => {
        try {
            setLoading(true)
            // Send empty object if no campaign_id, otherwise send campaign_id in payload
            const payload = campaignIdParam ? { campaign_id: campaignIdParam } : {}
            const response = await homePost('/campaign-lead-funnel-data', payload)
            
            if (response?.status && response?.data?.status && response?.data?.data) {
                const apiData = response.data.data
                
                // Map API response to component data structure
                const mappedData = [
                    {
                        title: "Total Leads",
                        average_value: apiData.total_leads?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.total_leads?.percentage_change || 0),
                        trend: mapTrend(apiData.total_leads?.trend)
                    },
                    {
                        title: "In Progress",
                        average_value: apiData.in_progress?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.in_progress?.percentage_change || 0),
                        trend: mapTrend(apiData.in_progress?.trend)
                    },
                    {
                        title: "Converted",
                        average_value: apiData.converted?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.converted?.percentage_change || 0),
                        trend: mapTrend(apiData.converted?.trend)
                    },
                    {
                        title: "Open",
                        average_value: apiData.open?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.open?.percentage_change || 0),
                        trend: mapTrend(apiData.open?.trend)
                    },
                    {
                        title: "Hot",
                        average_value: apiData.hot?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.hot?.percentage_change || 0),
                        trend: mapTrend(apiData.hot?.trend)
                    },
                    {
                        title: "Lost",
                        average_value: apiData.lost?.this_month?.toString() || "0",
                        average_value_count: "",
                        curret_value: formatPercentage(apiData.lost?.percentage_change || 0),
                        trend: mapTrend(apiData.lost?.trend)
                    }
                ]
                
                setData(mappedData)
            }
        } catch (error) {
            console.error('Error fetching campaign stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPercentage = (value) => {
        if (value === 0) return "0"
        return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
    }

    const mapTrend = (trend) => {
        if (trend === "increase") return "up"
        if (trend === "decrease") return "down"
        return "neutral" // for "no_change"
    }

    if (loading) {
        return (
            <>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="col-xxl-2 col-lg-4 col-md-6 leads-report-card">
                        <div className="card stretch stretch-full">
                            <div className="card-body">
                                <div className="fs-12 fw-medium text-muted mb-3">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        )
    }

    return (
        <>
            {
                data.map(({ average_value, average_value_count, curret_value, title, trend }, index) => {
                    const isNeutral = trend === "neutral"
                    const isUp = trend === "up"
                    
                    return (
                        <div key={index} className="col-xxl-2 col-lg-4 col-md-6 leads-report-card">
                            <div className="card stretch stretch-full">
                                <div className="card-body">
                                    <div className="fs-12 fw-medium text-muted mb-3">{title}</div>
                                    <div className="hstack justify-content-between lh-base">
                                        <h3><span className="counter">{average_value}</span>{average_value_count}</h3>
                                        <div className={`hstack gap-2 fs-11 ${isNeutral ? "text-muted" : (isUp ? "text-success" : "text-danger")} `}>
                                            <i className="fs-12">
                                                {
                                                    isNeutral ?
                                                        <FiMinusCircle />
                                                        : isUp ?
                                                            <FiArrowUpCircle />
                                                            :
                                                            <FiArrowDownCircle />
                                                }
                                            </i>
                                            <span>{curret_value}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                )
            }
        </>
    )
}

export default CampaignStats

