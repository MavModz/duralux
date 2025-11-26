'use client'
import React, { useState, useEffect } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'
import { homeGet } from '@/utils/api'

const DashboardStatsOverview = () => {
    const [statsData, setStatsData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true)
                const response = await homeGet('/admin-dashboard-top-section')
                
                if (response?.status && response?.data?.status) {
                    const data = response.data
                    
                    // Get total_lead as max value for progress calculation
                    const maxValue = data.total_lead || 1 // Use 1 as fallback to avoid division by zero
                    
                    // Calculate progress percentage for each stat
                    const calculateProgress = (value) => {
                        if (maxValue === 0) return 0
                        return Math.round((value / maxValue) * 100)
                    }
                    
                    // Map API response to component structure
                    const mappedData = [
                        {
                            id: 1,
                            title: "Today's Leads",
                            total_number: data.today_lead || 0,
                            completed_number: "",
                            progress: `${calculateProgress(data.today_lead || 0)}%`,
                            progress_info: `${data.today_lead || 0} Leads`,
                            icon: "feather-users"
                        },
                        {
                            id: 2,
                            title: "Converted Leads",
                            total_number: data.today_customer || 0,
                            completed_number: "",
                            progress: `${calculateProgress(data.today_customer || 0)}%`,
                            progress_info: `${data.today_customer || 0} Converted`,
                            icon: "feather-check-circle"
                        },
                        {
                            id: 3,
                            title: "Follow-Up Leads",
                            total_number: data.today_followupleads || 0,
                            completed_number: "",
                            progress: `${calculateProgress(data.today_followupleads || 0)}%`,
                            progress_info: `${data.today_followupleads || 0} Follow-ups`,
                            icon: "feather-repeat"
                        },
                        {
                            id: 4,
                            title: "Lost Leads",
                            total_number: data.today_lostlead || 0,
                            completed_number: "",
                            progress: `${calculateProgress(data.today_lostlead || 0)}%`,
                            progress_info: `${data.today_lostlead || 0} Lost`,
                            icon: "feather-alert-circle"
                        }
                    ]
                    
                    setStatsData(mappedData)
                } else {
                    console.error('Failed to fetch dashboard stats:', response?.data)
                    // Set empty data on error
                    setStatsData([])
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
                setStatsData([])
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardStats()
    }, [])

    if (loading) {
        return (
            <>
                {[1, 2, 3, 4].map((id) => (
                    <div key={id} className="col-xxl-3 col-md-6">
                        <div className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '150px' }}>
                                    <div className="spinner-border text-primary" role="status">
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
                statsData.map(({ id, completed_number, progress, progress_info, title, total_number, icon }) => (
                    <div key={id} className="col-xxl-3 col-md-6">
                        <div className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-4">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div className="avatar-text avatar-lg bg-gray-200 icon">
                                            {React.cloneElement(getIcon(icon), { size: "16" })}
                                        </div>
                                        <div>
                                            <div className="fs-4 fw-bold text-dark">
                                                <span className="counter">{completed_number ? completed_number + "/" : ""}</span>
                                                <span className="counter">{total_number}</span>
                                            </div>
                                            <h3 className="fs-13 fw-semibold text-truncate-1-line">{title}</h3>
                                        </div>
                                    </div>
                                    <Link href="#" className="lh-1">
                                        <FiMoreVertical className='fs-16' />
                                    </Link>
                                </div>
                                <div className="pt-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Link href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">{title}</Link>
                                        <div className="w-100 text-end">
                                            <span className="fs-12 text-dark">{progress_info}</span>{" "}
                                            <span className="fs-11 text-muted">({progress})</span>
                                        </div>
                                    </div>
                                    <div className="progress mt-2 ht-3">
                                        <div className={`progress-bar progress-${id}`} role="progressbar" style={{ width: progress }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </>
    )
}

export default DashboardStatsOverview

