'use client'
import React, { useState, useEffect } from 'react'
import { BsArrowLeft, BsArrowRight, BsDot } from 'react-icons/bs'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { homeGet } from '@/utils/api'

const CrmLeads = ({title}) => {
    const [userLeads, setUserLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    // Helper function to get user initials
    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.trim().split(/\s+/)
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    // Calculate pagination
    const totalPages = Math.ceil(userLeads.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentLeads = userLeads.slice(startIndex, endIndex)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    useEffect(() => {
        const fetchUserLeads = async () => {
            try {
                setLoading(true)
                const response = await homeGet('/admin-dashboard-user-based-leads')
                
                if (response?.status && response?.data?.success && Array.isArray(response?.data?.data)) {
                    setUserLeads(response.data.data)
                    // Reset to first page when new data is fetched
                    setCurrentPage(1)
                } else {
                    console.error('Failed to fetch user-based leads:', response?.data)
                    setUserLeads([])
                }
            } catch (error) {
                console.error('Error fetching user-based leads:', error)
                setUserLeads([])
            } finally {
                setLoading(false)
            }
        }

        fetchUserLeads()
    }, [refreshKey])

    if (isRemoved) {
        return null;
    }

    if (loading) {
        return (
            <div className="col-xxl-8">
                <div className="card stretch stretch-full">
                    <CardHeader title={title} />
                    <div className="card-body custom-card-action p-0">
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
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={title} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr className="border-b">
                                    <th scope="row">Name</th>
                                    <th>Total Leads</th>
                                    <th>Follow Ups</th>
                                    <th>Lost Leads</th>
                                    <th>Converted Leads</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLeads.length > 0 ? (
                                    currentLeads.map((user, index) => (
                                        <tr key={startIndex + index} className='chat-single-item'>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="text-white avatar-text user-avatar-text">
                                                        {getInitials(user.userName)}
                                                    </div>
                                                    <a href="#">
                                                        <span className="d-block">{user.userName || 'Unknown User'}</span>
                                                    </a>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-gray-200 text-dark">{user.totalLeads || 0}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-soft-info text-info">{user.followUps || 0}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-soft-danger text-danger">{user.lostLead || 0}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-soft-success text-success">{user.converted || 0}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No user-based leads found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer">
                    {userLeads.length > 0 && (
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="text-muted fs-12">
                                Showing {startIndex + 1} to {Math.min(endIndex, userLeads.length)} of {userLeads.length} entries
                            </div>
                            <nav>
                                <ul className="pagination mb-0 pagination-sm">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link" 
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <BsArrowLeft size={16} />
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            )
                                        } else if (
                                            (page === currentPage - 2 && currentPage > 3) ||
                                            (page === currentPage + 2 && currentPage < totalPages - 2)
                                        ) {
                                            return (
                                                <li key={page} className="page-item">
                                                    <span className="page-link">
                                                        <BsDot size={16} />
                                                    </span>
                                                </li>
                                            )
                                        }
                                        return null
                                    })}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link" 
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <BsArrowRight size={16} />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default CrmLeads
