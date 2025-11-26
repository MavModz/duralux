'use client'
import React, { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { homeGet } from '@/utils/api'

const CrmIntegration = ({ cardYSpaceClass, borderShow, title }) => {
    const [integrations, setIntegrations] = useState([])
    const [loading, setLoading] = useState(true)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    // Helper function to get integration logo and color
    const getIntegrationDetails = (name) => {
        const nameLower = name.toLowerCase()
        const integrationMap = {
            'facebook': {
                logo: '/images/brand/facebook.png',
                color: 'bg-primary'
            },
            'wordpress': {
                logo: '/images/brand/wordpress.png',
                color: 'bg-info'
            },
            'google': {
                logo: '/images/brand/googleads.png',
                color: 'bg-danger'
            },
            'googlesheet': {
                logo: '/images/brand/Sheet.png',
                color: 'bg-success'
            },
            'meta': {
                logo: '/images/brand/meta.png',
                color: 'bg-primary'
            },
            'twitter': {
                logo: '/images/brand/twitter.png',
                color: 'bg-info'
            },
            'instagram': {
                logo: '/images/brand/instagram.png',
                color: 'bg-danger'
            },
            'linkedin': {
                logo: '/images/brand/linkedin.png',
                color: 'bg-primary'
            }
        }
        
        return integrationMap[nameLower] || {
            logo: '/images/brand/default.png',
            color: 'bg-secondary'
        }
    }

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                setLoading(true)
                const response = await homeGet('/all-campaign-integrations')
                
                if (response?.status && response?.data?.status && Array.isArray(response?.data?.data)) {
                    const integrationsData = response.data.data.map((item, index) => {
                        const details = getIntegrationDetails(item.name)
                        return {
                            id: index + 1,
                            project_name: item.name,
                            project_category: 'Integration',
                            project_logo: details.logo,
                            progress: item.percentage || 0,
                            progress_color: details.color
                        }
                    })
                    setIntegrations(integrationsData)
                } else {
                    console.error('Failed to fetch integrations:', response?.data)
                    setIntegrations([])
                }
            } catch (error) {
                console.error('Error fetching integrations:', error)
                setIntegrations([])
            } finally {
                setLoading(false)
            }
        }

        fetchIntegrations()
    }, [refreshKey])

    if (isRemoved) {
        return null;
    }

    if (loading) {
        return (
            <div className="col-xxl-4">
                <div className="card stretch stretch-full">
                    <CardHeader title={title} />
                    <div className="card-body custom-card-action project-status">
                        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
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
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={title} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action project-status">
                    <div className="mb-3">
                        {integrations.length > 0 ? (
                            integrations.map(({ id, progress, project_category, project_logo, project_name, progress_color }, index) => (
                                <Fragment key={id}>
                                    {borderShow ? <hr className="border-dashed my-3" /> : ""}
                                    <div className={`d-flex ${index === integrations.length - 1 ? "mb-0" : cardYSpaceClass || "mb-3"}`}>
                                        <div className="d-flex w-50 align-items-center me-3">
                                            <img src={project_logo} alt={`${project_name}-logo`} className="me-3" width="35" height="35" onError={(e) => { e.target.src = '/images/brand/default.png' }} />
                                            <div>
                                                <Link href="#" className="text-truncate-1-line">{project_name}</Link>
                                                <div className="fs-11 text-muted">{project_category}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-grow-1 align-items-center">
                                            <div className="progress w-100 me-3 ht-5">
                                                <div className={`progress-bar ${progress_color}`} role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                            <span className="text-muted">{progress}%</span>
                                        </div>
                                    </div>
                                </Fragment>
                            ))
                        ) : (
                            <div className="text-center text-muted py-4">
                                <p className="mb-0">No integrations found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CardLoader refreshKey={refreshKey} />
        </div>
    )
}

export default CrmIntegration
