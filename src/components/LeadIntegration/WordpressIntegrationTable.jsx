'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiEdit3, FiCopy, FiCheck } from 'react-icons/fi'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import Image from 'next/image'
import Swal from 'sweetalert2'
import Dropdown from '@/components/shared/Dropdown'
import SelectDropdown from '@/components/shared/SelectDropdown'
import { homeGet, homePatch, homePost } from '@/utils/api'
import { successAlert, errorAlert } from '@/utils/alerts'
import { useDecodedToken } from '@/hooks/useDecodedToken'

const WordpressIntegrationTable = ({ title, data = [], loading = false, onToggleChange, onCreateNew, onDataChange }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { userData } = useDecodedToken()
    const [togglingIds, setTogglingIds] = useState(new Set())
    const [localData, setLocalData] = useState(data)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [showEditModal, setShowEditModal] = useState(false)
    const [isCreateMode, setIsCreateMode] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [campaigns, setCampaigns] = useState([])
    const [loadingCampaigns, setLoadingCampaigns] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copiedUrl, setCopiedUrl] = useState(null)

    // Update local data when prop changes
    React.useEffect(() => {
        setLocalData(data)
        setCurrentPage(1) // Reset to first page when data changes
    }, [data])

    // Calculate pagination
    const totalPages = Math.ceil(localData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = localData.slice(startIndex, endIndex)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Fetch campaigns for dropdown
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoadingCampaigns(true)
                const response = await homeGet('/campaigns/is_active')
                
                if (response?.status && response?.data?.status && response?.data?.data) {
                    const campaignOptions = response.data.data.map(campaign => ({
                        value: campaign._id,
                        label: campaign.campaign_name || 'Unnamed Campaign'
                    }))
                    setCampaigns(campaignOptions)
                    
                    // Set selected campaign after campaigns are loaded (only in edit mode)
                    if (!isCreateMode && editingItem) {
                        // Find campaign by _id from nested campaign object or campaign_id
                        const campaignId = editingItem.campaign?._id || editingItem.campaign_id
                        const currentCampaign = campaignOptions.find(c => c.value === campaignId)
                        setSelectedCampaign(currentCampaign || null)
                    }
                }
            } catch (error) {
                console.error('Error fetching campaigns:', error)
            } finally {
                setLoadingCampaigns(false)
            }
        }

        if (showEditModal) {
            fetchCampaigns()
        }
    }, [showEditModal, editingItem, isCreateMode])

    // Handle action click
    const handleActionClick = (actionLabel, integrationId, event) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        const item = localData.find(i => i._id === integrationId)
        if (!item) return

        if (actionLabel === 'Edit') {
            setIsCreateMode(false)
            setEditingItem(item)
            setEditTitle(item.title || '')
            // Find and set the current campaign - wait for campaigns to load
            setShowEditModal(true)
        } else if (actionLabel === 'Copy Url') {
            handleCopyUrl(item)
        }
    }

    // Handle generate new link button
    const handleGenerateNewLink = () => {
        setIsCreateMode(true)
        setEditingItem(null)
        setEditTitle('')
        setSelectedCampaign(null)
        setShowEditModal(true)
    }

    // Expose handleGenerateNewLink to parent via ref
    React.useEffect(() => {
        if (onCreateNew && typeof onCreateNew === 'object' && 'current' in onCreateNew) {
            onCreateNew.current = handleGenerateNewLink
        }
    }, [onCreateNew])

    // Handle copy URL
    const handleCopyUrl = async (item) => {
        if (!item._id) {
            errorAlert('Integration ID not available')
            return
        }

        // Get base URL from environment variable
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.nrichlearning.com'
        
        // Construct webhook URL
        const webhookUrl = `${baseUrl}/wordpress-automation/${item._id}`
        
        try {
            await navigator.clipboard.writeText(webhookUrl)
            setCopiedUrl(item._id)
            successAlert('URL copied to clipboard!')
            setTimeout(() => setCopiedUrl(null), 2000)
        } catch (error) {
            console.error('Failed to copy URL:', error)
            errorAlert('Failed to copy URL')
        }
    }

    // Handle close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setIsCreateMode(false)
        setEditingItem(null)
        setEditTitle('')
        setSelectedCampaign(null)
    }

    // Handle save edit/create
    const handleSaveEdit = async () => {
        // Validate required fields
        if (!editTitle.trim()) {
            errorAlert('Title is required')
            return
        }

        if (!selectedCampaign) {
            errorAlert('Campaign is required')
            return
        }

        try {
            setSaving(true)

            if (isCreateMode) {
                // Create new integration
                const payload = {
                    title: editTitle.trim(),
                    campaign: selectedCampaign.value
                }

                const response = await homePost('/wordpress-automation', payload)

                if (response?.status && response?.data?.status) {
                    successAlert('Integration created successfully')
                    // Notify parent component to refetch data from server
                    // This ensures we get the accurate state including active status
                    if (onDataChange) {
                        await onDataChange()
                    }
                    handleCloseEditModal()
                } else {
                    errorAlert(response?.data?.msg || 'Failed to create integration')
                }
            } else {
                // Edit existing integration
                if (!editingItem) return

                // Check if anything changed
                const titleChanged = editTitle !== editingItem.title
                const campaignChanged = selectedCampaign?.value !== (editingItem.campaign_id || editingItem.campaign?._id)

                if (!titleChanged && !campaignChanged) {
                    // No changes, just close modal
                    handleCloseEditModal()
                    return
                }
                
                // Always send both title and campaign in payload
                const payload = {
                    _id: editingItem._id,
                    title: editTitle.trim(),
                    campaign: selectedCampaign?.value || editingItem.campaign_id || editingItem.campaign?._id
                }

                const response = await homePatch(`/wordpress-edit/${editingItem._id}`, payload)

                if (response?.status && response?.data?.status) {
                    successAlert('Integration updated successfully')
                    // Update local data
                    setLocalData(prevData =>
                        prevData.map(item =>
                            item._id === editingItem._id
                                ? {
                                    ...item,
                                    title: editTitle.trim(),
                                    campaign_name: selectedCampaign?.label || item.campaign_name,
                                    campaign_id: selectedCampaign?.value || item.campaign_id
                                }
                                : item
                        )
                    )
                    handleCloseEditModal()
                } else {
                    errorAlert(response?.data?.msg || 'Failed to update integration')
                }
            }
        } catch (error) {
            console.error(`Error ${isCreateMode ? 'creating' : 'updating'} integration:`, error)
            errorAlert(`An error occurred while ${isCreateMode ? 'creating' : 'updating'} integration`)
        } finally {
            setSaving(false)
        }
    }

    // Action items for dropdown
    const actionItems = [
        { label: 'Edit', icon: <FiEdit3 /> },
        { label: 'Copy Url', icon: <FiCopy /> }
    ]

    // Handle toggle change
    const handleToggle = async (item) => {
        // Validate item has _id (integration ID, not campaign ID)
        if (!item || !item._id) {
            console.error('Invalid item or missing _id:', item)
            errorAlert('Integration ID is missing. Please refresh the page.')
            return
        }

        // Use only the integration _id (not campaign._id)
        const integrationId = item._id

        const newActiveState = !item.active
        const action = newActiveState ? 'activate' : 'pause'
        const integrationTitle = item.title || 'this integration'

        // Show warning modal
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `
                <div style="text-align: left; padding: 1rem 0;">
                    <p style="margin-bottom: 1rem; font-size: 1rem;">
                        You are about to <strong>${action}</strong> the WordPress integration: <strong>${integrationTitle}</strong>.
                    </p>
                    <p style="margin-bottom: 0; color: #6c757d; font-size: 0.875rem;">
                        ${newActiveState 
                            ? 'This will activate the integration and start receiving leads from WordPress forms.' 
                            : 'This will pause the integration and stop receiving leads from WordPress forms.'}
                    </p>
                </div>
            `,
            icon: 'warning',
            iconColor: '#ffc107',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-warning m-1',
                cancelButton: 'btn btn-secondary m-1'
            },
            buttonsStyling: false
        })

        // If user cancels, don't update state (toggle will remain in original position)
        if (!result.isConfirmed) {
            return
        }

        // User confirmed, proceed with API call
        // Double-check integrationId is valid
        if (!integrationId) {
            console.error('Integration ID is missing:', item)
            errorAlert('Integration ID is missing. Please refresh the page.')
            return
        }

        // Optimistically update UI
        setLocalData(prevData =>
            prevData.map(i =>
                i._id === integrationId ? { ...i, active: newActiveState } : i
            )
        )

        // Add to toggling set
        setTogglingIds(prev => new Set(prev).add(integrationId))

        try {
            if (onToggleChange && integrationId) {
                await onToggleChange(integrationId, newActiveState)
            } else {
                throw new Error('Toggle handler or integration ID is missing')
            }
        } catch (error) {
            // Revert on error
            setLocalData(prevData =>
                prevData.map(i =>
                    i._id === integrationId ? { ...i, active: !newActiveState } : i
                )
            )
            console.error('Toggle error:', error)
        } finally {
            // Remove from toggling set
            setTogglingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(integrationId)
                return newSet
            })
        }
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            return dateString
        }
    }

    // Helper function to get initials
    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.trim().split(/\s+/)
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={title} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action p-0">
                    <div className="table-responsive" style={{ overflowX: 'unset', minHeight: '70vh' }}>
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr className="border-b">
                                    <th scope="row">Title</th>
                                    <th>Campaign Name</th>
                                    <th>Connected</th>
                                    <th>Created By</th>
                                    <th>Created At</th>
                                    <th>Active</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : localData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No integrations found
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((item, index) => {
                                        return (
                                        <tr key={item._id || `item-${index}`} className='chat-single-item'>
                                            <td>
                                                <span className="fw-semibold">{item.title || 'N/A'}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-gray-200 text-dark">
                                                    {item.campaign_name || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.connected ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>
                                                    {item.connected ? 'Connected' : 'Disconnected'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    {item.created_by?.profile_image ? (
                                                        <div className="avatar-image">
                                                            <Image 
                                                                width={38} 
                                                                height={38} 
                                                                sizes='100vw' 
                                                                src={item.created_by.profile_image} 
                                                                alt="user-img" 
                                                                className="img-fluid" 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-white avatar-text user-avatar-text">
                                                            {getInitials(item.created_by?.name || 'Unknown')}
                                                        </div>
                                                    )}
                                                    <span className="d-block">{item.created_by?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(item.created_at || item.createdAt)}</td>
                                            <td>
                                                <div className="form-check form-switch form-switch-sm">
                                                    <input
                                                        className="form-check-input c-pointer"
                                                        type="checkbox"
                                                        checked={item.active || false}
                                                        onChange={() => handleToggle(item)}
                                                        disabled={togglingIds.has(item._id)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <Dropdown
                                                    dropdownItems={actionItems}
                                                    triggerClass="avatar-md"
                                                    triggerPosition="0,21"
                                                    triggerIcon={<FiMoreVertical size={16} />}
                                                    onClick={handleActionClick}
                                                    id={item._id}
                                                />
                                            </td>
                                        </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {localData.length > 10 && (
                    <div className="card-footer">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="text-muted fs-12">
                                Showing {startIndex + 1} to {Math.min(endIndex, localData.length)} of {localData.length} entries
                            </div>
                            <nav>
                                <ul className="pagination mb-0 pagination-sm">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                                                <li key={page} className="page-item disabled">
                                                    <span className="page-link">...</span>
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
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
                <CardLoader refreshKey={refreshKey} />
            </div>

            {/* Edit/Create Modal */}
            {showEditModal && (
                <>
                    <div
                        className="modal fade show"
                        id="editIntegrationModal"
                        tabIndex={-1}
                        role="dialog"
                        aria-labelledby="editIntegrationModalLabel"
                        aria-hidden={false}
                        style={{ display: 'block' }}
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-bottom">
                                    <h5 className="modal-title" id="editIntegrationModalLabel">
                                        {isCreateMode ? 'Generate New Link' : 'Edit Integration'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={handleCloseEditModal}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold mb-2">
                                            Title <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Enter integration title"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold mb-2">
                                            Campaign Name <span className="text-danger">*</span>
                                        </label>
                                        <SelectDropdown
                                            options={campaigns}
                                            selectedOption={selectedCampaign}
                                            onSelectOption={setSelectedCampaign}
                                            className="w-100"
                                        />
                                        {loadingCampaigns && (
                                            <small className="text-muted d-block mt-1">Loading campaigns...</small>
                                        )}
                                        {!loadingCampaigns && campaigns.length === 0 && (
                                            <small className="text-muted d-block mt-1">No active campaigns found</small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseEditModal}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSaveEdit}
                                        disabled={saving || !editTitle.trim() || !selectedCampaign}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop fade show"
                        onClick={handleCloseEditModal}
                    />
                </>
            )}
        </div>
    )
}

export default WordpressIntegrationTable
