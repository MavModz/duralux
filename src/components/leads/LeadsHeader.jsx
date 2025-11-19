'use client'
import React from 'react'
import { FiBarChart, FiBriefcase, FiClock, FiDollarSign, FiEye, FiFilter, FiFlag, FiPaperclip, FiPlus, FiTrash2, FiUserCheck, FiUserMinus, FiUsers, FiXCircle } from 'react-icons/fi'
import { BsFiletypeCsv, BsFiletypeExe, BsFiletypePdf, BsFiletypeTsx, BsFiletypeXml, BsPrinter } from 'react-icons/bs';
import Dropdown from '@/components/shared/Dropdown';
import LeadsStatisticsTwo from "../widgetsStatistics/LeadsStatisticsTwo"
import Link from 'next/link';
import { homeDelete } from '@/utils/api';
import { confirmDeleteLead } from '@/utils/confirmDeleteLead';
import Swal from 'sweetalert2';

const filterAction = [
    { label: "All", icon: <FiEye /> },
    { label: "Group", icon: <FiUsers /> },
    { label: "Country", icon: <FiFlag /> },
    { label: "Invoice", icon: <FiDollarSign /> },
    { label: "Project", icon: <FiBriefcase /> },
    { label: "Active", icon: <FiUserCheck /> },
    { label: "Inactive", icon: <FiUserMinus /> },
];
export const fileType = [
    { label: "PDF", icon: <BsFiletypePdf /> },
    { label: "CSV", icon: <BsFiletypeCsv /> },
    // { label: "XML", icon: <BsFiletypeXml /> },
    // { label: "Text", icon: <BsFiletypeTsx /> },
    // { label: "Excel", icon: <BsFiletypeExe /> },
    { label: "Print", icon: <BsPrinter /> },
];

const LeadsHeader = ({ selectedLeadIds = [], activeTab = 'all', onTabChange, followUpCount = 0, incompleteCount = 0, leadsData = [] }) => {
    const [deleting, setDeleting] = React.useState(false);

    const handleDeleteSelected = async () => {
        if (!selectedLeadIds || selectedLeadIds.length === 0) {
            return;
        }

        try {
            // Show confirmation modal
            const confirmation = await confirmDeleteLead(`${selectedLeadIds.length} selected lead(s)`);
            
            if (!confirmation.confirmed) {
                return; // User cancelled the deletion
            }

            setDeleting(true);
            
            // Call delete API
            const response = await homeDelete('/delete-selected-leads', {
                leadIds: selectedLeadIds
            });
            
            if (response?.status && response?.data?.status) {
                // Show success message
                Swal.fire({
                    title: "Deleted!",
                    text: `${selectedLeadIds.length} lead(s) deleted successfully.`,
                    icon: "success",
                    customClass: {
                        confirmButton: "btn btn-success",
                    }
                }).then(() => {
                    // Reload the page to refresh the leads list
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    title: "Error!",
                    text: response?.data?.message || 'Failed to delete leads',
                    icon: "error",
                    customClass: {
                        confirmButton: "btn btn-danger",
                    }
                });
            }
        } catch (err) {
            console.error('Error deleting leads:', err);
            Swal.fire({
                title: "Error!",
                text: 'An error occurred while deleting the leads',
                icon: "error",
                customClass: {
                    confirmButton: "btn btn-danger",
                }
            });
        } finally {
            setDeleting(false);
        }
    };

    const hasSelectedLeads = selectedLeadIds && selectedLeadIds.length > 0;

    const handleTabClick = (tab) => {
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    // Export/Print handlers
    const handleExportAction = (actionType) => {
        // Get leads to export - selected leads or all leads in current tab
        let leadsToExport = [];
        
        if (selectedLeadIds && selectedLeadIds.length > 0) {
            // Export selected leads
            leadsToExport = leadsData.filter(lead => selectedLeadIds.includes(lead.id));
        } else {
            // No leads selected - show warning
            Swal.fire({
                title: "No Leads Selected",
                text: "Please select the leads you want to export or print.",
                icon: "warning",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        if (leadsToExport.length === 0) {
            Swal.fire({
                title: "No Leads Found",
                text: "No leads available to export.",
                icon: "info",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        switch (actionType) {
            case 'PDF':
                exportToPDF(leadsToExport);
                break;
            case 'CSV':
                exportToCSV(leadsToExport);
                break;
            case 'Print':
                printLeads(leadsToExport);
                break;
            default:
                break;
        }
    };

    // Export to PDF
    const exportToPDF = (leads) => {
        // Create a simple HTML table for PDF
        let htmlContent = `
            <html>
                <head>
                    <title>Leads Export - ${activeTab}</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>Leads Export - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Source</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Campaign</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        leads.forEach(lead => {
            htmlContent += `
                <tr>
                    <td>${lead.customer?.name || 'N/A'}</td>
                    <td>${lead.email || 'N/A'}</td>
                    <td>${lead.phone || 'N/A'}</td>
                    <td>${lead.source?.media || 'N/A'}</td>
                    <td>${lead.customer?.priority || 'Medium'}</td>
                    <td>${lead.status || 'N/A'}</td>
                    <td>${lead.assignedTo || 'Unassigned'}</td>
                    <td>${lead.campaignName || 'N/A'}</td>
                </tr>
            `;
        });

        htmlContent += `
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };

    // Export to CSV
    const exportToCSV = (leads) => {
        // Helper function to escape CSV values
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return 'N/A';
            const stringValue = String(value);
            // If value contains comma, quote, or newline, wrap in quotes and escape quotes
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const headers = ['Name', 'Email', 'Phone', 'Source', 'Priority', 'Status', 'Assigned To', 'Campaign'];
        const csvRows = [headers.join(',')];

        leads.forEach(lead => {
            const row = [
                escapeCSV(lead.customer?.name),
                escapeCSV(lead.email),
                escapeCSV(lead.phone),
                escapeCSV(lead.source?.media),
                escapeCSV(lead.customer?.priority || 'Medium'),
                escapeCSV(lead.status),
                escapeCSV(lead.assignedTo || 'Unassigned'),
                escapeCSV(lead.campaignName)
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel compatibility
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print leads
    const printLeads = (leads) => {
        let htmlContent = `
            <html>
                <head>
                    <title>Leads Print - ${activeTab}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                        }
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>Leads - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Source</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Campaign</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        leads.forEach(lead => {
            htmlContent += `
                <tr>
                    <td>${lead.customer?.name || 'N/A'}</td>
                    <td>${lead.email || 'N/A'}</td>
                    <td>${lead.phone || 'N/A'}</td>
                    <td>${lead.source?.media || 'N/A'}</td>
                    <td>${lead.customer?.priority || 'Medium'}</td>
                    <td>${lead.status || 'N/A'}</td>
                    <td>${lead.assignedTo || 'Unassigned'}</td>
                    <td>${lead.campaignName || 'N/A'}</td>
                </tr>
            `;
        });

        htmlContent += `
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between gap-2 page-header-right-items-wrapper">
                {/* Tabs Section */}
                <div className="d-flex align-items-center gap-2">
                    <button 
                        className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-light-brand'}`}
                        onClick={() => handleTabClick('all')}
                        type="button"
                    >
                        All
                    </button>
                    {followUpCount > 0 && (
                        <button 
                            className={`btn ${activeTab === 'follow-up' ? 'btn-primary' : 'btn-light-brand'}`}
                            onClick={() => handleTabClick('follow-up')}
                            type="button"
                        >
                            <FiClock size={16} className="me-1" />
                            Follow Up ({followUpCount})
                        </button>
                    )}
                    {incompleteCount > 0 && (
                        <button 
                            className={`btn ${activeTab === 'incomplete' ? 'btn-primary' : 'btn-light-brand'}`}
                            onClick={() => handleTabClick('incomplete')}
                            type="button"
                        >
                            <FiXCircle size={16} className="me-1" />
                            Incomplete ({incompleteCount})
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex align-items-center gap-2">
                    {hasSelectedLeads && (
                        <button 
                            className="btn btn-danger"
                            onClick={handleDeleteSelected}
                            disabled={deleting}
                        >
                            <FiTrash2 size={16} className='me-2' />
                            <span>Delete Selected ({selectedLeadIds.length})</span>
                        </button>
                    )}
                    <a href="#" className="btn btn-icon btn-light-brand" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                        <FiBarChart size={16} strokeWidth={1.6} />
                    </a>
                    <Dropdown
                        dropdownItems={filterAction}
                        triggerPosition={"0, 12"}
                        triggerIcon={<FiFilter size={16} strokeWidth={1.6} />}
                        triggerClass='btn btn-icon btn-light-brand'
                        isAvatar={false}
                    />
                    <Dropdown
                        dropdownItems={fileType}
                        triggerPosition={"0, 12"}
                        triggerIcon={<FiPaperclip size={16} strokeWidth={1.6} />}
                        triggerClass='btn btn-icon btn-light-brand'
                        iconStrokeWidth={0}
                        isAvatar={false}
                        onClick={handleExportAction}
                    />
                    <Link href="/admin/leads/add" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        <span>Create Lead</span>
                    </Link>
                </div>
            </div>

            <div id="collapseOne" className="accordion-collapse collapse page-header-collapse">
                <div className="accordion-body pb-2">
                    <div className="row">
                        <LeadsStatisticsTwo />
                    </div>
                </div>
            </div>
        </>
    )
}

export default LeadsHeader