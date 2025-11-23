'use client'
import React, { useState, useEffect } from 'react'
import SelectManagersModal from './SelectManagersModal'
import LeadDistributionModal from './LeadDistributionModal'
import { homePost } from '@/utils/api'
import Swal from 'sweetalert2'

const CreateCampaignSidebar = () => {
    const [campaignName, setCampaignName] = useState('')
    const [selectedManagers, setSelectedManagers] = useState([])
    const [showManagersModal, setShowManagersModal] = useState(false)
    const [showLeadDistributionModal, setShowLeadDistributionModal] = useState(false)
    const [leadDistribution, setLeadDistribution] = useState(null)
    const [errors, setErrors] = useState({})
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (e) => {
        e.preventDefault()
        
        // Validation
        const newErrors = {}
        if (!campaignName.trim()) {
            newErrors.campaignName = 'Campaign Name is required'
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Clear errors
        setErrors({})
        
        // Build payload
        const payload = {
            campaign_name: campaignName.trim(),
            managers: selectedManagers.map(manager => manager._id || manager.id),
        }

        // Add lead distribution data
        if (leadDistribution) {
            payload.type = leadDistribution.method
            
            if (leadDistribution.method === 'round_robin' && leadDistribution.subadmins) {
                payload.roundRobin = {
                    subadmins: leadDistribution.subadmins.map(subadmin => subadmin._id || subadmin.id)
                }
            }
            // Add other distribution types here when implemented
            // else if (leadDistribution.method === 'category_based') {
            //     payload.categoryBased = { ... }
            // }
        }

        try {
            setIsSaving(true)
            const response = await homePost('/campaign', payload)
            
            if (response?.status && response?.data?.status) {
                // Reset form
                setCampaignName('')
                setSelectedManagers([])
                setLeadDistribution(null)
                
                // Dispatch event to refresh campaigns list
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('campaign-created'))
                }
                
                // Show success message and close sidebar when user clicks OK
                Swal.fire({
                    title: "Success!",
                    text: "Campaign created successfully.",
                    icon: "success",
                    customClass: {
                        confirmButton: "btn btn-success",
                    }
                }).then(() => {
                    // Force close sidebar using data-bs-dismiss approach
                    const closeButton = document.querySelector('#createCampaignOffcanvas [data-bs-dismiss="offcanvas"]')
                    if (closeButton) {
                        closeButton.click()
                    } else {
                        // Fallback: try to find any button with data-bs-dismiss in the offcanvas
                        const offcanvasElement = document.getElementById('createCampaignOffcanvas')
                        if (offcanvasElement) {
                            const dismissButton = offcanvasElement.querySelector('[data-bs-dismiss="offcanvas"]')
                            if (dismissButton) {
                                dismissButton.click()
                            }
                        }
                    }
                })
            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.message || response?.data?.msg || 'Failed to create campaign',
                    icon: "error",
                    customClass: {
                        confirmButton: "btn btn-danger",
                    }
                })
            }
        } catch (error) {
            console.error('Error creating campaign:', error)
            Swal.fire({
                title: "Error!",
                text: 'An error occurred while creating the campaign',
                icon: "error",
                customClass: {
                    confirmButton: "btn btn-danger",
                }
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        setCampaignName('')
        setSelectedManagers([])
        setLeadDistribution(null)
        setErrors({})
    }

    const handleSelectManagers = () => {
        // Close sidebar
        const offcanvasElement = document.getElementById('createCampaignOffcanvas')
        if (offcanvasElement && typeof window !== 'undefined' && window.bootstrap) {
            const offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasElement)
            if (offcanvasInstance) {
                offcanvasInstance.hide()
            }
        }
        // Open modal
        setShowManagersModal(true)
    }

    const handleManagersModalClose = () => {
        setShowManagersModal(false)
        // Reopen sidebar
        setTimeout(() => {
            const offcanvasElement = document.getElementById('createCampaignOffcanvas')
            if (offcanvasElement && typeof window !== 'undefined' && window.bootstrap) {
                const offcanvas = new window.bootstrap.Offcanvas(offcanvasElement)
                offcanvas.show()
            }
        }, 300)
    }

    const handleManagersSave = (managers) => {
        setSelectedManagers(managers)
    }

    // Initialize tooltips for manager initials
    useEffect(() => {
        if (selectedManagers.length > 0 && typeof window !== 'undefined') {
            const timer = setTimeout(() => {
                const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"][data-title]')
                const existingTooltip = document.querySelector('.custom-tooltip')
                
                if (existingTooltip && tooltipElements.length > 0) {
                    tooltipElements.forEach((element) => {
                        if (element.hasAttribute('data-tooltip-initialized')) {
                            return
                        }
                        
                        element.setAttribute('data-tooltip-initialized', 'true')
                        
                        const handleMouseMove = (e) => {
                            const title = element.getAttribute("data-title")
                            if (title && existingTooltip) {
                                const rect = element.getBoundingClientRect()
                                const tooltipRect = existingTooltip.getBoundingClientRect()
                                const viewportWidth = window.innerWidth
                                
                                let top = rect.top - tooltipRect.height - 10
                                let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
                                
                                if (top < 0) {
                                    top = rect.bottom + 10
                                }
                                if (left + tooltipRect.width > viewportWidth) {
                                    left = rect.left - tooltipRect.width - 10
                                }
                                if (left < 0) {
                                    left = rect.right + 10
                                }
                                
                                existingTooltip.style.top = `${top}px`
                                existingTooltip.style.left = `${left}px`
                                existingTooltip.textContent = title
                                existingTooltip.style.opacity = "1"
                                existingTooltip.style.display = "block"
                            }
                        }
                        
                        const handleMouseLeave = () => {
                            if (existingTooltip) {
                                existingTooltip.style.opacity = "0"
                                existingTooltip.style.display = "none"
                            }
                        }
                        
                        element.addEventListener("mousemove", handleMouseMove)
                        element.addEventListener("mouseleave", handleMouseLeave)
                    })
                }
            }, 100)
            
            return () => clearTimeout(timer)
        }
    }, [selectedManagers])

    const handleSelectLeadDistribution = () => {
        // Close sidebar
        const offcanvasElement = document.getElementById('createCampaignOffcanvas')
        if (offcanvasElement && typeof window !== 'undefined' && window.bootstrap) {
            const offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasElement)
            if (offcanvasInstance) {
                offcanvasInstance.hide()
            }
        }
        // Open modal
        setShowLeadDistributionModal(true)
    }

    const handleLeadDistributionModalClose = () => {
        setShowLeadDistributionModal(false)
        // Reopen sidebar
        setTimeout(() => {
            const offcanvasElement = document.getElementById('createCampaignOffcanvas')
            if (offcanvasElement && typeof window !== 'undefined' && window.bootstrap) {
                const offcanvas = new window.bootstrap.Offcanvas(offcanvasElement)
                offcanvas.show()
            }
        }, 300)
    }

    const handleLeadDistributionSave = (distributionData) => {
        setLeadDistribution(distributionData)
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.trim().split(/\s+/)
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    return (
        <div
            className="offcanvas offcanvas-end"
            tabIndex={-1}
            id="createCampaignOffcanvas"
            aria-labelledby="createCampaignOffcanvasLabel"
        >
            <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title" id="createCampaignOffcanvasLabel">
                    Create Your Campaign
                </h5>
                <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                    onClick={handleClose}
                />
            </div>
            <div className="offcanvas-body">
                <form onSubmit={handleSave}>
                    <div className="form-group mb-4">
                        <label htmlFor="campaignName" className="form-label fw-semibold">
                            Campaign Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.campaignName ? 'is-invalid' : ''}`}
                            id="campaignName"
                            placeholder="Enter campaign name"
                            value={campaignName}
                            onChange={(e) => {
                                setCampaignName(e.target.value)
                                if (errors.campaignName) {
                                    setErrors({ ...errors, campaignName: '' })
                                }
                            }}
                        />
                        {errors.campaignName && (
                            <div className="invalid-feedback">
                                {errors.campaignName}
                            </div>
                        )}
                    </div>

                    {/* Select Managers Field */}
                    <div className="form-group mb-4">
                        <label className="form-label fw-semibold">
                            Select Managers
                        </label>
                        <div
                            className="form-control"
                            style={{
                                minHeight: '38px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                padding: selectedManagers.length > 0 ? '0.375rem 0.75rem' : '0.375rem 0.75rem'
                            }}
                            onClick={handleSelectManagers}
                        >
                            {selectedManagers.length > 0 ? (
                                <>
                                    {selectedManagers.slice(0, 2).map((manager, index) => (
                                        <div
                                            key={manager._id || index}
                                            className="avatar-text avatar-sm bg-soft-primary text-primary"
                                            data-toggle="tooltip"
                                            data-bs-trigger="hover"
                                            data-title={manager.name || 'Manager'}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '600',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {getInitials(manager.name)}
                                        </div>
                                    ))}
                                    {selectedManagers.length > 2 && (
                                        <span className="text-muted fs-12 fw-bold">
                                            +{selectedManagers.length - 2}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-muted">Click to select managers</span>
                            )}
                        </div>
                    </div>

                    {/* Lead Distribution Field */}
                    <div className="form-group mb-4">
                        <label className="form-label fw-semibold">
                            Lead Distribution
                        </label>
                        <div
                            className="form-control"
                            style={{
                                minHeight: '38px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#6c757d'
                            }}
                            onClick={handleSelectLeadDistribution}
                        >
                            {leadDistribution ? (
                                <span className="text-dark fw-semibold">
                                    {leadDistribution.method === 'round_robin' && leadDistribution.subadmins?.length > 0
                                        ? `Round Robin (${leadDistribution.subadmins.length} subadmin${leadDistribution.subadmins.length > 1 ? 's' : ''})`
                                        : leadDistribution.method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            ) : (
                                <span className="text-muted">Click to configure lead distribution</span>
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="offcanvas"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <SelectManagersModal
                isOpen={showManagersModal}
                onClose={handleManagersModalClose}
                onSave={handleManagersSave}
                selectedManagers={selectedManagers}
            />
            <LeadDistributionModal
                isOpen={showLeadDistributionModal}
                onClose={handleLeadDistributionModalClose}
                onSave={handleLeadDistributionSave}
            />
        </div>
    )
}

export default CreateCampaignSidebar

