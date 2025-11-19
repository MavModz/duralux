'use client'
import React, { memo, useEffect, useState } from 'react'
import Table from '@/components/shared/table/Table';
import { FiAlertOctagon, FiArchive, FiClock, FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2 } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown';
import SelectDropdown from '@/components/shared/SelectDropdown';
import getIcon from '@/utils/getIcon';
import { homePost, homeDelete } from '@/utils/api';
import { confirmDeleteLead } from '@/utils/confirmDeleteLead';
import Swal from 'sweetalert2';
import Link from 'next/link';


const actions = [
    { label: "Edit", icon: <FiEdit3 /> },
    { label: "Print", icon: <FiPrinter /> },
    { label: "Remind", icon: <FiClock /> },
    { type: "divider" },
    { label: "Archive", icon: <FiArchive /> },
    { label: "Report Spam", icon: <FiAlertOctagon />, },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 />, },
];

const TableCell = memo(({ options, defaultSelect }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    return (
        <SelectDropdown
            options={options}
            defaultSelect={defaultSelect}
            selectedOption={selectedOption}
            onSelectOption={(option) => setSelectedOption(option)}
        />
    );
});


const LeadssTable = ({ onSelectionChange, activeTab = 'all', onLeadsDataChange }) => {
    const [leadsData, setLeadsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    // Notify parent when leads data changes
    useEffect(() => {
        if (onLeadsDataChange) {
            onLeadsDataChange(leadsData);
        }
    }, [leadsData, onLeadsDataChange]);

    // Map source to icon
    const getSourceIcon = (source) => {
        const sourceMap = {
            'manual': 'feather-user',
            'facebook': 'feather-facebook',
            'twitter': 'feather-twitter',
            'linkedin': 'feather-linkedin',
            'instagram': 'feather-instagram',
            'google': 'feather-globe',
            'email': 'feather-mail',
        };
        return sourceMap[source?.toLowerCase()] || 'feather-globe';
    };

    // Format date with time
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date as DD/MM/YYYY (no time)
    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Capitalize first letter of a string
    const capitalizeFirst = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Transform API data to table format
    const transformLeadsData = (apiData) => {
        return apiData.map((lead) => ({
            id: lead._id || lead.unique_id,
            customer: {
                name: lead.name || 'N/A',
                img: lead.profile_image || lead.image || '',
                priority: lead.priority || 'Medium',
                createdDate: formatDateShort(lead.createdAt || lead.date)
            },
            email: lead.email || '',
            source: {
                media: lead.source || 'manual',
                icon: getSourceIcon(lead.source)
            },
            phone: lead.phone || '',
            assignedTo: lead.assigned_to?.name || lead.assigned_to || 'Unassigned',
            campaignName: lead.campaign?.campaign_name || lead.campaign_name || 'N/A',
            status: lead.lead_status || lead.User_status || 'Open Lead'
        }));
    };

    // Transform follow-up API data to table format
    const transformFollowUpData = (apiData) => {
        return apiData.map((followUp) => {
            const lead = followUp.customer_id || {};
            return {
                id: lead._id || lead.unique_id,
                customer: {
                    name: lead.name || 'N/A',
                    img: lead.profile_image || lead.image || '',
                    priority: lead.priority || 'Medium',
                    createdDate: formatDateShort(lead.createdAt || lead.date)
                },
                email: lead.email || '',
                source: {
                    media: lead.source || 'manual',
                    icon: getSourceIcon(lead.source)
                },
                phone: lead.phone || '',
                assignedTo: lead.assigned_to?.name || lead.assigned_to || 'Unassigned',
                campaignName: lead.campaign?.campaign_name || lead.campaign_name || 'N/A',
                status: followUp.status || 'Open Lead'
            };
        });
    };

    // Fetch leads data
    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let response;
                let transformedData;

                // Use different API for Follow Up tab
                if (activeTab === 'follow-up') {
                    const followUpPayload = {
                        page: 1,
                        limit: 50,
                        filter: {}
                    };
                    response = await homePost('/view-followup', followUpPayload);
                    if (response?.status && response?.data?.status !== false && response?.data?.data) {
                        transformedData = transformFollowUpData(response.data.data);
                        setLeadsData(transformedData);
                    } else {
                        setError(response?.data?.message || 'Failed to fetch follow-ups');
                        console.error('API Error:', response);
                    }
                } else {
                    // Prepare payload for POST request
                    const payload = {
                        filter: {
                            customer_type: "lead"
                        },
                        limit: 20,
                        skip: 0
                    };

                    // Add status filter based on active tab
                    if (activeTab === 'incomplete') {
                        payload.filter.lead_status = "Incomplete";
                    }
                    // For 'all' tab, no additional filter is needed
                    
                    response = await homePost('/all-leads', payload);
                    
                    if (response?.status && response?.data?.status && response?.data?.data) {
                        transformedData = transformLeadsData(response.data.data);
                        setLeadsData(transformedData);
                    } else {
                        setError(response?.data?.message || 'Failed to fetch leads');
                        console.error('API Error:', response);
                    }
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
                setError('An error occurred while fetching leads');
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [activeTab]);

    // Handle table selection change - must be defined before any conditional returns
    const handleSelectionChange = React.useCallback((table) => {
        const selectedRowIds = table.getSelectedRowModel().rows.map(row => row.original.id);
        setSelectedRows(selectedRowIds);
        if (onSelectionChange) {
            onSelectionChange(selectedRowIds);
        }
    }, [onSelectionChange]);

    // Function to handle delete action
    const handleDeleteLead = async (leadId, leadName) => {
        try {
            // Show confirmation modal
            const confirmation = await confirmDeleteLead(leadName);
            
            if (!confirmation.confirmed) {
                return; // User cancelled the deletion
            }

            setDeleting(true);
            
            // Call delete API
            const response = await homeDelete(`/delete-leads/${leadId}`);
            
            if (response?.status && response?.data?.status) {
                // Show success message
                Swal.fire({
                    title: "Deleted!",
                    text: "Lead deleted successfully.",
                    icon: "success",
                    customClass: {
                        confirmButton: "btn btn-success",
                    }
                });
                
                // Refresh the leads list
                let refreshResponse;
                let transformedData;

                if (activeTab === 'follow-up') {
                    // Use /view-followup API for follow-up tab (POST)
                    const followUpPayload = {
                        page: 1,
                        limit: 50,
                        filter: {}
                    };
                    refreshResponse = await homePost('/view-followup', followUpPayload);
                    if (refreshResponse?.status && refreshResponse?.data?.status !== false && refreshResponse?.data?.data) {
                        transformedData = transformFollowUpData(refreshResponse.data.data);
                        setLeadsData(transformedData);
                    }
                } else {
                    const payload = {
                        filter: {
                            customer_type: "lead"
                        },
                        limit: 20,
                        skip: 0
                    };

                    // Add status filter based on active tab
                    if (activeTab === 'incomplete') {
                        payload.filter.lead_status = "Incomplete";
                    }
                    
                    refreshResponse = await homePost('/all-leads', payload);
                    
                    if (refreshResponse?.status && refreshResponse?.data?.status && refreshResponse?.data?.data) {
                        transformedData = transformLeadsData(refreshResponse.data.data);
                        setLeadsData(transformedData);
                    }
                }
            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.message || 'Failed to delete lead',
                    icon: "error",
                    customClass: {
                        confirmButton: "btn btn-danger",
                    }
                });
            }
        } catch (err) {
            console.error('Error deleting lead:', err);
            Swal.fire({
                title: "Error!",
                text: 'An error occurred while deleting the lead',
                icon: "error",
                customClass: {
                    confirmButton: "btn btn-danger",
                }
            });
        } finally {
            setDeleting(false);
        }
    };

    // Handle dropdown action click
    const handleActionClick = (actionLabel, leadId, event) => {
        // Prevent default link behavior and Bootstrap modal trigger
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (actionLabel === 'Delete') {
            const lead = leadsData.find(l => l.id === leadId);
            const leadName = lead?.customer?.name || 'this lead';
            handleDeleteLead(leadId, leadName);
        }
        // Handle other actions here if needed
    };

    const columns = [
        {
            accessorKey: 'id',
            header: ({ table }) => {
                const checkboxRef = React.useRef(null);
                const rowSelection = table.getState().rowSelection;
                const pagination = table.getState().pagination;
                
                // Get only the rows on the current page
                const currentPageRows = table.getRowModel().rows;
                const currentPageRowIds = currentPageRows.map(row => row.id);
                
                // Check if all rows on current page are selected
                const areAllCurrentPageRowsSelected = currentPageRows.length > 0 && 
                    currentPageRowIds.every(rowId => rowSelection[rowId]);
                
                // Check if some (but not all) rows on current page are selected
                const areSomeCurrentPageRowsSelected = currentPageRowIds.some(rowId => 
                    rowSelection[rowId]
                ) && !areAllCurrentPageRowsSelected;

                useEffect(() => {
                    if (checkboxRef.current) {
                        checkboxRef.current.indeterminate = areSomeCurrentPageRowsSelected;
                    }
                }, [areSomeCurrentPageRowsSelected, rowSelection, pagination]);

                // Custom handler to toggle only current page rows
                const handleToggleAllCurrentPage = () => {
                    const currentSelection = table.getState().rowSelection;
                    const newSelection = { ...currentSelection };
                    
                    if (areAllCurrentPageRowsSelected) {
                        // Deselect all current page rows
                        currentPageRowIds.forEach(rowId => {
                            delete newSelection[rowId];
                        });
                    } else {
                        // Select all current page rows
                        currentPageRowIds.forEach(rowId => {
                            newSelection[rowId] = true;
                        });
                    }
                    
                    table.setRowSelection(newSelection);
                };

                return (
                    <input
                        type="checkbox"
                        className="custom-table-checkbox"
                        ref={checkboxRef}
                        checked={areAllCurrentPageRowsSelected}
                        onChange={handleToggleAllCurrentPage}
                    />
                );
            },
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="custom-table-checkbox"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            meta: {
                headerClassName: 'width-30',
            },
        },

        {
            accessorKey: 'customer',
            header: () => 'Customer',
            cell: (info) => {
                const roles = info.getValue();
                return (
                    <a href="#" className="hstack gap-3">
                        {
                            roles?.img ?
                                <div className="avatar-image avatar-md">
                                    <img src={roles?.img} alt="" className="img-fluid" />
                                </div>
                                :
                                <div className="text-white avatar-text user-avatar-text avatar-md">{roles?.name.substring(0, 1)}</div>
                        }
                        <div>
                            <span className="text-truncate-1-line">{roles?.name}</span>
                            <div className="text-muted fs-12 mt-1">
                                {capitalizeFirst(roles?.priority || 'Medium')} • {roles?.createdDate || ''}
                            </div>
                        </div>
                    </a>
                )
            }
        },
        {
            accessorKey: 'email',
            header: () => 'Email',
            cell: (info) => <a href="apps-email.html">{info.getValue()}</a>
        },
        {
            accessorKey: 'source',
            header: () => 'Source',
            cell: (info) => {
                const x = info.getValue()
                return (
                    <div className="hstack gap-2">
                        <div className="avatar-text avatar-sm">
                            {getIcon(x.icon)}
                        </div>
                        <a href="#">{x.media}</a>
                    </div>
                )
            }
        },
        {
            accessorKey: 'phone',
            header: () => 'Phone',
            cell: (info) => <a href="tel:">{info.getValue()}</a>
            // meta: {
            //     className: "fw-bold text-dark"
            // }
        },
        {
            accessorKey: 'assignedTo',
            header: () => 'Assigned To',
            cell: (info) => {
                const assignedTo = info.getValue();
                return (
                    <span style={{ 
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '400'
                    }}>
                        {assignedTo}
                    </span>
                );
            }
        },
        {
            accessorKey: 'campaignName',
            header: () => 'Campaign Name',
            cell: (info) => {
                const campaignName = info.getValue();
                return (
                    <span style={{ 
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '400'
                    }}>
                        {campaignName}
                    </span>
                );
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue();
                // Get status color and styling based on status value
                const getStatusStyle = (statusValue) => {
                    const statusMap = {
                        'Lost Lead': {
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5'
                        },
                        'Open Lead': {
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            border: '1px solid #86efac'
                        },
                        'New Lead': {
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            border: '1px solid #93c5fd'
                        },
                        'Converted Lead': {
                            backgroundColor: '#e0e7ff',
                            color: '#6366f1',
                            border: '1px solid #a5b4fc'
                        },
                        'Hot Lead': {
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                        },
                        'In Progress': {
                            backgroundColor: '#f3e8ff',
                            color: '#9333ea',
                            border: '1px solid #c4b5fd'
                        },
                    };
                    return statusMap[statusValue] || {
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        border: '1px solid #d1d5db'
                    };
                };
                
                const statusStyle = getStatusStyle(status);
                
                return (
                    <span 
                        className="badge" 
                        style={{ 
                            ...statusStyle,
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block',
                            textTransform: 'none',
                            letterSpacing: '0.3px'
                        }}
                    >
                        {status || 'N/A'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: info => {
                const row = info.row.original;
                const leadId = row.id; // This is the _id from the API
                
                return (
                    <div className="hstack gap-2 justify-content-end">
                        <Link 
                            href={`/admin/leads/view/${leadId}`}
                            className="avatar-text avatar-md"
                            title="View Lead"
                        >
                            <FiEye />
                        </Link>
                        <Dropdown 
                            dropdownItems={actions} 
                            triggerClass='avatar-md' 
                            triggerPosition={"0,21"} 
                            triggerIcon={<FiMoreHorizontal />}
                            onClick={handleActionClick}
                            id={leadId}
                        />
                    </div>
                );
            },
            meta: {
                headerClassName: 'text-end'
            }
        },
    ]

    if (loading) {
        return (
            <div className="text-center p-5" style={{minHeight:'75vh'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading leads...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    return (
        <>
            <Table 
                data={leadsData} 
                columns={columns} 
                onSelectionChange={handleSelectionChange}
            />
        </>
    )
}

export default LeadssTable