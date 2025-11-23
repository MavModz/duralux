'use client'
import React, { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi'
import { homeGet } from '@/utils/api'

const AUTOMATION_METHODS = [
    { id: 'round_robin', label: 'Round Robin' },
    { id: 'category_based', label: 'Category Based' },
    { id: 'source_based', label: 'Source Based' },
    { id: 'frequency_based', label: 'Frequency Based' }
]

const LeadDistributionModal = ({ isOpen, onClose, onSave }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedMethod, setSelectedMethod] = useState(null)
    const [subadmins, setSubadmins] = useState([])
    const [selectedSubadmins, setSelectedSubadmins] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setCurrentStep(1)
            setSelectedMethod(null)
            setSelectedSubadmins([])
        }
    }, [isOpen])

    useEffect(() => {
        if (selectedMethod === 'round_robin' && currentStep === 2) {
            fetchSubadmins()
        }
    }, [selectedMethod, currentStep])

    const fetchSubadmins = async () => {
        try {
            setLoading(true)
            // Using campaign-managers API and filtering for Subadmin role
            const response = await homeGet('/campaign-managers')
            
            if (response?.status && response?.data?.status && response?.data?.data) {
                // Filter for Subadmin role
                const subadminList = response.data.data.filter(manager => 
                    manager.role?.toLowerCase() === 'subadmin'
                )
                setSubadmins(subadminList)
            }
        } catch (error) {
            console.error('Error fetching subadmins:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId)
    }

    const handleNext = () => {
        if (currentStep === 1 && selectedMethod) {
            if (selectedMethod === 'round_robin') {
                setCurrentStep(2)
            } else {
                // For other methods, go directly to save (or step 3 if needed)
                handleSave()
            }
        } else if (currentStep === 2 && selectedSubadmins.length > 0) {
            setCurrentStep(3)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSave = () => {
        const distributionData = {
            method: selectedMethod,
            subadmins: selectedSubadmins,
            order: selectedSubadmins.map((sub, index) => ({ ...sub, order: index }))
        }
        onSave(distributionData)
        handleClose()
    }

    const handleClose = () => {
        setCurrentStep(1)
        setSelectedMethod(null)
        setSelectedSubadmins([])
        onClose()
    }

    const toggleSubadmin = (subadmin) => {
        const isSelected = selectedSubadmins.some(s => s._id === subadmin._id)
        if (isSelected) {
            setSelectedSubadmins(selectedSubadmins.filter(s => s._id !== subadmin._id))
        } else {
            setSelectedSubadmins([...selectedSubadmins, subadmin])
        }
    }

    const moveSubadmin = (index, direction) => {
        const newOrder = [...selectedSubadmins]
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
        }
        setSelectedSubadmins(newOrder)
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.trim().split(/\s+/)
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="modal fade show"
                id="leadDistributionModal"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="leadDistributionModalLabel"
                aria-hidden={false}
                style={{ display: 'block' }}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title" id="leadDistributionModalLabel">
                                Lead Distribution
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleClose}
                            />
                        </div>
                        <div className="modal-body">
                            {/* Step Indicator */}
                            <div className="d-flex align-items-center justify-content-center mb-4">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div
                                            className={`d-flex align-items-center justify-content-center rounded-circle ${
                                                currentStep >= step
                                                    ? 'bg-primary text-white'
                                                    : 'bg-light text-muted'
                                            }`}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {currentStep > step ? <FiCheck size={20} /> : step}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`mx-2 ${
                                                    currentStep > step ? 'bg-primary' : 'bg-light'
                                                }`}
                                                style={{ width: '60px', height: '2px' }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Step 1: Select Automation Method */}
                            {currentStep === 1 && (
                                <div>
                                    <h6 className="mb-4">Select Automation Method</h6>
                                    <div className="row g-3">
                                        {AUTOMATION_METHODS.map((method) => (
                                            <div key={method.id} className="col-md-6">
                                                <div
                                                    className={`card border ${
                                                        selectedMethod === method.id
                                                            ? 'border-primary bg-light'
                                                            : ''
                                                    }`}
                                                    onClick={() => handleMethodSelect(method.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: selectedMethod === method.id ? '#008ae41a' : 'white'
                                                    }}
                                                >
                                                    <div className="card-body text-center p-4">
                                                        <div className="form-check d-flex justify-content-center">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="automationMethod"
                                                                id={method.id}
                                                                checked={selectedMethod === method.id}
                                                                onChange={() => handleMethodSelect(method.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <label
                                                                className="form-check-label ms-2 fw-semibold"
                                                                htmlFor={method.id}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {method.label}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Subadmins (Round Robin) */}
                            {currentStep === 2 && selectedMethod === 'round_robin' && (
                                <div>
                                    <h6 className="mb-4">Select Subadmins</h6>
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : subadmins.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            No subadmins available
                                        </div>
                                    ) : (
                                        <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {subadmins.map((subadmin) => {
                                                const isSelected = selectedSubadmins.some(s => s._id === subadmin._id)
                                                return (
                                                    <div
                                                        key={subadmin._id}
                                                        className={`list-group-item list-group-item-action`}
                                                        onClick={() => toggleSubadmin(subadmin)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            backgroundColor: isSelected ? '#008ae41a' : 'transparent',
                                                            color: isSelected ? '#008ce4' : '#212529'
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="avatar-text avatar-md bg-soft-primary text-primary">
                                                                    {getInitials(subadmin.name)}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">{subadmin.name || 'Unknown'}</div>
                                                                    <div className="fs-12 text-muted">{subadmin.role || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleSubadmin(subadmin)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Review Order (Round Robin) */}
                            {currentStep === 3 && selectedMethod === 'round_robin' && (
                                <div>
                                    <h6 className="mb-4">Review Distribution Order</h6>
                                    <p className="text-muted mb-4 fs-12">
                                        Leads will be distributed in the order shown below. You can reorder by using the arrow buttons.
                                    </p>
                                    {selectedSubadmins.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            No subadmins selected
                                        </div>
                                    ) : (
                                        <div className="list-group">
                                            {selectedSubadmins.map((subadmin, index) => (
                                                <div
                                                    key={subadmin._id}
                                                    className="list-group-item d-flex align-items-center justify-content-between"
                                                    style={{ backgroundColor: '#008ae41a' }}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                                                            style={{ width: '30px', height: '30px', fontSize: '14px' }}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        <div className="avatar-text avatar-md bg-soft-primary text-primary">
                                                            {getInitials(subadmin.name)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{subadmin.name || 'Unknown'}</div>
                                                            <div className="fs-12 text-muted">{subadmin.role || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            className="btn btn-sm btn-light"
                                                            onClick={() => moveSubadmin(index, 'up')}
                                                            disabled={index === 0}
                                                            title="Move up"
                                                        >
                                                            <FiChevronLeft size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-light"
                                                            onClick={() => moveSubadmin(index, 'down')}
                                                            disabled={index === selectedSubadmins.length - 1}
                                                            title="Move down"
                                                        >
                                                            <FiChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-top d-flex justify-content-between">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleBack}
                                    >
                                        <FiChevronLeft className="me-1" />
                                        Back
                                    </button>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                {currentStep === 3 ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleNext}
                                        disabled={
                                            (currentStep === 1 && !selectedMethod) ||
                                            (currentStep === 2 && selectedSubadmins.length === 0)
                                        }
                                    >
                                        Next
                                        <FiChevronRight className="ms-1" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
        </>
    )
}

export default LeadDistributionModal

