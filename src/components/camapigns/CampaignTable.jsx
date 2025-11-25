'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import Dropdown from '@/components/shared/Dropdown'
import { homeGet, homeDelete, homePost } from '@/utils/api'
import { confirmDelete } from '@/utils/confirmDelete'
import Swal from 'sweetalert2'
import { FiCopy, FiEdit, FiFilter, FiGitMerge, FiTrash2 } from 'react-icons/fi'

const CampaignTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [campaigns, setCampaigns] = useState([])
    const [allCampaigns, setAllCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5)
    const router = useRouter()

    useEffect(() => {
        fetchCampaigns()
    }, [refreshKey])

    useEffect(() => {
        // Update displayed campaigns based on current page
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        setCampaigns(allCampaigns.slice(startIndex, endIndex))
    }, [currentPage, allCampaigns, itemsPerPage])

    // Listen for campaign creation event to refresh the list
    useEffect(() => {
        const handleCampaignCreated = () => {
            fetchCampaigns()
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('campaign-created', handleCampaignCreated)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('campaign-created', handleCampaignCreated)
            }
        }
    }, [])

    // Initialize tooltips for manager initials when campaigns are loaded
    useEffect(() => {
        if (!loading && campaigns.length > 0 && typeof window !== 'undefined') {
            const timer = setTimeout(() => {
                // Get or create tooltip element
                let tooltip = document.querySelector('.custom-tooltip');
                if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.className = 'custom-tooltip';
                    document.body.appendChild(tooltip);
                }

                // Find all manager initial elements within the campaigns table
                const tableElement = document.querySelector('.table.table-hover');
                if (!tableElement) return;
                
                const managerElements = tableElement.querySelectorAll('[data-toggle="tooltip"][data-title]');
                
                managerElements.forEach((element) => {
                    // Check if element already has tooltip listeners (marked with data attribute)
                    if (element.hasAttribute('data-tooltip-initialized')) {
                        return; // Already initialized
                    }
                    
                    // Mark as initialized
                    element.setAttribute('data-tooltip-initialized', 'true');
                    
                    // Add tooltip listeners
                    const handleMouseMove = (e) => {
                        const title = element.getAttribute("data-title");
                        if (title && tooltip) {
                            const rect = element.getBoundingClientRect();
                            const tooltipRect = tooltip.getBoundingClientRect();
                            const viewportWidth = window.innerWidth;
                            
                            let top = rect.top - tooltipRect.height - 10;
                            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                            
                            if (top < 0) {
                                top = rect.bottom + 10;
                            }
                            if (left + tooltipRect.width > viewportWidth) {
                                left = rect.left - tooltipRect.width - 10;
                            }
                            if (left < 0) {
                                left = rect.right + 10;
                            }
                            
                            tooltip.style.top = `${top}px`;
                            tooltip.style.left = `${left}px`;
                            tooltip.textContent = title;
                            tooltip.style.opacity = "1";
                            tooltip.style.display = "block";
                        }
                    };
                    
                    const handleMouseLeave = () => {
                        if (tooltip) {
                            tooltip.style.opacity = "0";
                            tooltip.style.display = "none";
                        }
                    };
                    
                    element.addEventListener("mousemove", handleMouseMove);
                    element.addEventListener("mouseleave", handleMouseLeave);
                });
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [campaigns, loading])

    const fetchCampaigns = async () => {
        try {
            setLoading(true)
            const response = await homeGet('/campaigns')
            
            if (response?.status && response?.data?.status && response?.data?.data) {
                // Store all campaigns
                setAllCampaigns(response.data.data)
                // Reset to first page
                setCurrentPage(1)
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(allCampaigns.length / itemsPerPage)
    const hasMoreCampaigns = allCampaigns.length > itemsPerPage

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleAction = async (label, id) => {
        const campaign = campaigns.find(c => (c._id === id || c.id === id))
        const campaignName = campaign?.campaign_name || campaign?.name || 'Campaign'
        
        switch (label) {
            case "Edit":
                router.push(`/admin/campaign/${id}/edit`)
                break
            case "Copy":
                const copyConfirmation = await Swal.fire({
                    title: "Copy Campaign",
                    text: `Copy "${campaignName}"?`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, copy it!",
                    cancelButtonText: "Cancel",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-secondary",
                    }
                })
                
                if (copyConfirmation.isConfirmed) {
                    try {
                        const response = await homePost(`/campaign/${id}/copy`, {})
                        if (response?.status && response?.data?.status) {
                            Swal.fire({
                                title: "Copied!",
                                text: "Campaign copied successfully.",
                                icon: "success",
                                customClass: {
                                    confirmButton: "btn btn-success",
                                }
                            })
                            // Refresh campaigns list
                            fetchCampaigns()
                            // Dispatch event to refresh other components
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('campaign-created'))
                            }
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response?.data?.message || response?.data?.msg || 'Failed to copy campaign',
                                icon: "error",
                                customClass: {
                                    confirmButton: "btn btn-danger",
                                }
                            })
                        }
                    } catch (error) {
                        console.error('Error copying campaign:', error)
                        Swal.fire({
                            title: "Error!",
                            text: 'An error occurred while copying the campaign',
                            icon: "error",
                            customClass: {
                                confirmButton: "btn btn-danger",
                            }
                        })
                    }
                }
                break
            case "Delete":
                const confirmation = await confirmDelete(id)
                if (confirmation.confirmed) {
                    try {
                        const response = await homeDelete(`/campaign/${id}`)
                        if (response?.status && response?.data?.status) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Campaign deleted successfully.",
                                icon: "success",
                                customClass: {
                                    confirmButton: "btn btn-success",
                                }
                            })
                            // Refresh campaigns
                            fetchCampaigns()
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response?.data?.message || response?.data?.msg || 'Failed to delete campaign',
                                icon: "error",
                                customClass: {
                                    confirmButton: "btn btn-danger",
                                }
                            })
                        }
                    } catch (error) {
                        console.error('Error deleting campaign:', error)
                        Swal.fire({
                            title: "Error!",
                            text: 'An error occurred while deleting the campaign',
                            icon: "error",
                            customClass: {
                                confirmButton: "btn btn-danger",
                            }
                        })
                    }
                }
                break
            case "Merge Leads":
                Swal.fire({
                    title: "Merge Leads",
                    text: `Merge leads for "${campaignName}"?`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Yes, merge!",
                    cancelButtonText: "Cancel",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-secondary",
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Handle merge leads logic here
                        Swal.fire({
                            title: "Merged!",
                            text: "Leads merged successfully.",
                            icon: "success",
                            customClass: {
                                confirmButton: "btn btn-success",
                            }
                        })
                    }
                })
                break
            case "View Funnel":
                // Dispatch event to update CampaignStats with campaign_id
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('view-campaign-funnel', {
                        detail: { campaignId: id }
                    }))
                }
                router.push(`/admin/campaign/${id}/funnel`)
                break
            default:
                break
        }
    }

    // Get initials from name (max 2 characters)
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

    if (loading) {
        return (
            <div className="col-xxl-6">
                <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                    <CardHeader title={"Campaigns"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
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
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Campaigns"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    <div className="table-responsive" style={{ overflowX: 'unset' }}>
                        <table className="table table-hover">
                        <thead>
                            <tr>
                                    <th scope="col">Campaign Name</th>
                                    <th scope="col">Created Date</th>
                                    <th scope="col">Managers</th>
                                <th scope="col" className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                    campaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted p-4">
                                                No campaigns found
                                            </td>
                                        </tr>
                                    ) : (
                                        campaigns.map((campaign) => {
                                            const campaignId = campaign._id || campaign.id
                                            const campaignName = campaign.campaign_name || campaign.name || 'Unnamed Campaign'
                                            const createdAt = campaign.createdAt 
                                                ? new Date(campaign.createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })
                                                : 'N/A'
                                            const managers = campaign.managers || []
                                            const visibleManagers = managers.slice(0, 2)
                                            const remainingCount = managers.length - 2

                                            return (
                                                <tr key={campaignId} className='leads-status'>
                                                    <td>
                                                        <Link href={`/admin/campaign/${campaignId}`} className="text-decoration-none">
                                                            {campaignName}
                                                        </Link>
                                                    </td>
                                                    <td>{createdAt}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {visibleManagers.map((manager, index) => {
                                                                const managerName = manager.name || 'Manager'
                                                                return (
                                                                    <div
                                                                        key={manager._id || index}
                                                                        className="avatar-text avatar-sm bg-soft-primary text-primary"
                                                                        data-toggle="tooltip"
                                                                        data-bs-trigger="hover"
                                                                        data-title={managerName}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontWeight: '600',
                                                                            fontSize: '0.75rem',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {getInitials(managerName)}
                                                                    </div>
                                                                )
                                                            })}
                                                            {remainingCount > 0 && (
                                                                <span 
                                                                    className="text-muted fs-12 fw-bold"
                                                                    data-toggle="tooltip"
                                                                    data-bs-trigger="hover"
                                                                    data-title={managers.slice(2).map(m => m.name).join(', ')}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    +{remainingCount}
                                                                </span>
                                                            )}
                                                            {managers.length === 0 && (
                                                                <span className="text-muted fs-12">No managers</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-end">
                                                        <Dropdown 
                                                            dropdownItems={tableActions} 
                                                            dropdownParentStyle={"hstack text-end justify-content-end"} 
                                                            id={campaignId} 
                                                            onClick={handleAction}
                                    />
                                                    </td>
                                                </tr>
                                            )
                                        })
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
                {hasMoreCampaigns && (
                    <div className="card-footer">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="text-muted fs-12">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, allCampaigns.length)} of {allCampaigns.length} campaigns
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
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
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
        </div>
    )
}

export default CampaignTable

const tableActions = [
    { label: "Edit", icon: <FiEdit /> },
    { label: "Copy", icon: <FiCopy /> },
    { type: "divider" },
    { label: "Merge Leads", icon: <FiGitMerge /> },
    { label: "View Funnel", icon: <FiFilter /> },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 /> },
];
