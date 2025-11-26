'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { homeGet } from '@/utils/api';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const LeadsRecordChart = () => {
    const [chartOptions, setChartOptions] = useState(null)
    const [leadStats, setLeadStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    // Generate month labels for current year
    const getMonthLabels = () => {
        const currentYear = new Date().getFullYear().toString().slice(-2)
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
        return months.map(month => `${month}/${currentYear}`)
    }

    // Create chart options based on monthly data
    const createChartOptions = (monthlyData) => {
        const monthLabels = getMonthLabels()
        
        return {
            chart: {
                width: "100%",
                stacked: !1,
                toolbar: {
                    show: !1
                },
            },
            stroke: {
                width: [2],
                curve: "smooth",
                lineCap: "round"
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: "end",
                    columnWidth: "29%"
                }
            },
            colors: ["#008ce4"],
            series: [
                {
                    name: "Total Leads",
                    type: "bar",
                    data: monthlyData || []
                }
            ],
            fill: {
                opacity: [1],
                gradient: {
                    inverseColors: !1,
                    shade: "light",
                    type: "vertical",
                    opacityFrom: 0.5,
                    opacityTo: 0.1,
                    stops: [0, 100, 100, 100]
                }
            },
            markers: {
                size: 0
            },
            xaxis: {
                categories: monthLabels,
                axisBorder: {
                    show: !1
                },
                axisTicks: {
                    show: !1
                },
                labels: {
                    style: {
                        fontSize: "10px",
                        colors: "#A0ACBB"
                    }
                },
            },
            yaxis: {
                labels: {
                    formatter: function (e) {
                        return +e
                    },
                    offsetX: 0,
                    offsetY: 0,
                    style: {
                        colors: "#A0ACBB"
                    }
                }
            },
            grid: {
                xaxis: {
                    lines: {
                        show: !1
                    }
                },
                yaxis: {
                    lines: {
                        show: !1
                    }
                },
                padding: {
                    left: 35,
                    right: 28
                },
            },
            dataLabels: {
                enabled: !1
            },
            tooltip: {
                y: {
                    formatter: function (e) {
                        return +e + " Leads"
                    }
                },
                style: {
                    fontSize: "12px",
                    fontFamily: "Inter"
                }
            },
            legend: {
                show: !1,
                labels: {
                    fontSize: "12px",
                    colors: "#A0ACBB"
                },
                fontSize: "12px",
                fontFamily: "Inter"
            }
        }
    }

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                setLoading(true)
                const response = await homeGet('/admin-dashboard-monthly-data')
                
                if (response?.status && response?.data?.status && Array.isArray(response?.data?.data)) {
                    const monthlyData = response.data.data
                    const options = createChartOptions(monthlyData)
                    setChartOptions(options)
                    
                    // Extract leadStats if available
                    if (response?.data?.leadStats) {
                        setLeadStats(response.data.leadStats)
                    } else {
                        // Set default empty stats
                        setLeadStats({
                            "Open Lead": 0,
                            "Hot Lead": 0,
                            "In Progress": 0,
                            "Converted Lead": 0
                        })
                    }
                } else {
                    console.error('Failed to fetch monthly data:', response?.data)
                    // Set default empty data
                    const options = createChartOptions([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                    setChartOptions(options)
                    setLeadStats({
                        "Open Lead": 0,
                        "Hot Lead": 0,
                        "In Progress": 0,
                        "Lost Lead": 0
                    })
                }
            } catch (error) {
                console.error('Error fetching monthly data:', error)
                // Set default empty data on error
                const options = createChartOptions([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                setChartOptions(options)
                setLeadStats({
                    "Open Lead": 0,
                    "Hot Lead": 0,
                    "In Progress": 0,
                    "Lost Lead": 0
                })
            } finally {
                setLoading(false)
            }
        }

        fetchMonthlyData()
    }, [refreshKey])

    if (isRemoved) {
        return null;
    }

    if (loading || !chartOptions) {
        return (
            <div className="col-xxl-8">
                <div className="card stretch stretch-full">
                    <CardHeader title={"Total Leads Record"} />
                    <div className="card-body custom-card-action p-0">
                        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '377px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Total Leads Record"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartOptions.series}
                        height={377}
                    />
                </div>
                <div className="card-footer">
                    <div className="row g-4">
                        {leadStats && (
                            <>
                                <Card 
                                    bg_color={"bg-primary"} 
                                    price={`${leadStats["Open Lead"] || 0}%`} 
                                    progress={`${leadStats["Open Lead"] || 0}%`} 
                                    title={"Open Lead"} 
                                />
                                <Card 
                                    bg_color={"bg-success"} 
                                    price={`${leadStats["Hot Lead"] || 0}%`} 
                                    progress={`${leadStats["Hot Lead"] || 0}%`} 
                                    title={"Hot Lead"} 
                                />
                                <Card 
                                    bg_color={"bg-warning"} 
                                    price={`${leadStats["In Progress"] || 0}%`} 
                                    progress={`${leadStats["In Progress"] || 0}%`} 
                                    title={"In Progress"} 
                                />
                                <Card 
                                    bg_color={"bg-info"} 
                                    price={`${leadStats["Converted Lead"] || 0}%`} 
                                    progress={`${leadStats["Converted Lead"] || 0}%`} 
                                    title={"Converted Lead"} 
                                />
                            </>
                        )}
                    </div>
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default LeadsRecordChart

const Card = ({ title, price, progress, bg_color }) => {
    return (
        <div className="col-lg-3">
            <div className="p-3 border border-dashed rounded">
                <div className="fs-12 text-muted mb-1">{title}</div>
                <h6 className="fw-bold text-dark">{price}</h6>
                <div className="progress mt-2 ht-3">
                    <div className={`progress-bar ${bg_color}`} role="progressbar" style={{ width: progress }}></div>
                </div>
            </div>
        </div>
    )
}