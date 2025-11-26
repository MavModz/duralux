'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { homePost } from '@/utils/api'

const UpcomingSchedule = ({ title }) => {
    const [followups, setFollowups] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedComment, setSelectedComment] = useState('')
    const [showModal, setShowModal] = useState(false)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return { day: '', month: '', time: '' }
        
        const date = new Date(dateString)
        const day = date.getDate()
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const month = months[date.getMonth()]
        
        return { day, month }
    }

    // Helper function to convert 24-hour time to 12-hour format with AM/PM
    const formatTime = (timeString) => {
        if (!timeString) return ''
        
        // Split time string (e.g., "20:29" -> ["20", "29"])
        const [hours, minutes] = timeString.split(':')
        
        if (!hours || !minutes) return timeString
        
        const hour24 = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        
        // Convert to 12-hour format
        let hour12 = hour24 % 12
        if (hour12 === 0) hour12 = 12 // 0 should be 12
        
        const ampm = hour24 >= 12 ? 'PM' : 'AM'
        
        // Format with leading zero for minutes if needed
        const formattedMinute = minute.toString().padStart(2, '0')
        
        return `${hour12}:${formattedMinute} ${ampm}`
    }

    // Helper function to get color based on index
    const getColor = (index) => {
        const colors = ['primary', 'success', 'warning', 'danger', 'info']
        return colors[index % colors.length]
    }

    useEffect(() => {
        const fetchFollowups = async () => {
            try {
                setLoading(true)
                const response = await homePost('/view-followup', {})
                
                if (response?.status && response?.data?.status && Array.isArray(response?.data?.data)) {
                    setFollowups(response.data.data)
                } else {
                    console.error('Failed to fetch followups:', response?.data)
                    setFollowups([])
                }
            } catch (error) {
                console.error('Error fetching followups:', error)
                setFollowups([])
            } finally {
                setLoading(false)
            }
        }

        fetchFollowups()
    }, [refreshKey])

    const handleViewNotes = (comment) => {
        setSelectedComment(comment || 'No notes available')
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedComment('')
    }

    if (isRemoved) {
        return null;
    }

    if (loading) {
        return (
            <div className="col-xxl-4">
                <div className="card stretch stretch-full">
                    <CardHeader title={title} />
                    <div className="card-body">
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
        <>
            <div className="col-xxl-4">
                <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                    <CardHeader title={title} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                    <div className="card-body">
                        {followups.length > 0 ? (
                            followups.map((followup, index) => {
                                const leadName = followup?.customer_id?.name || 'Unknown Lead'
                                const reminderTime = formatTime(followup?.reminder_time || '')
                                const reminderDate = followup?.reminder_date || ''
                                const comment = followup?.comment || ''
                                const dateInfo = formatDate(reminderDate)
                                const color = getColor(index)

                                return (
                                    <div key={followup._id || index} className="p-3 border border-dashed rounded-3 schedule-card mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`wd-50 ht-50 lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 bg-soft-${color} text-${color} schedule-date`}>
                                                    <span className="fs-18 fw-bold mb-1 d-block">{dateInfo.day}</span>
                                                    <span className="fs-10 fw-semibold text-uppercase d-block">{dateInfo.month}</span>
                                                </div>
                                                <div className="text-dark">
                                                    <Link href="#" className="fw-bold mb-2 text-truncate-1-line d-block">{leadName}</Link>
                                                    <span className="fs-11 fw-normal text-muted text-truncate-1-line">{reminderTime}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleViewNotes(comment)}
                                            >
                                                View Notes
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-muted py-4">
                                <p className="mb-0">No upcoming follow-ups</p>
                            </div>
                        )}
                    </div>
                    <Link href="#" className="card-footer fs-11 fw-bold text-uppercase text-center py-4">Upcomming Schedule</Link>
                    <CardLoader refreshKey={refreshKey} />
                </div>
            </div>

            {/* Notes Modal */}
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        id="followUpNotesModal"
                        tabIndex={-1}
                        role="dialog"
                        aria-labelledby="followUpNotesModalLabel"
                        aria-hidden={false}
                        style={{ display: 'block' }}
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-bottom">
                                    <h5 className="modal-title" id="followUpNotesModalLabel">
                                        Follow-Up Notes
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={handleCloseModal}
                                    />
                                </div>
                                <div className="modal-body">
                                    <p className="mb-0">{selectedComment}</p>
                                </div>
                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                </>
            )}
        </>
    )
}

export default UpcomingSchedule
