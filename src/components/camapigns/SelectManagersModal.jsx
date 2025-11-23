'use client'
import React, { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { homeGet } from '@/utils/api'

const SelectManagersModal = ({ isOpen, onClose, onSave, selectedManagers = [] }) => {
    const [managers, setManagers] = useState([])
    const [filteredManagers, setFilteredManagers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selected, setSelected] = useState(selectedManagers)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchManagers()
            setSelected(selectedManagers)
        }
    }, [isOpen, selectedManagers])

    useEffect(() => {
        filterManagers()
    }, [searchQuery, managers])

    const fetchManagers = async () => {
        try {
            setLoading(true)
            const response = await homeGet('/campaign-managers')
            
            if (response?.status && response?.data?.status && response?.data?.data) {
                setManagers(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching managers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterManagers = () => {
        if (!searchQuery.trim()) {
            setFilteredManagers(managers)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = managers.filter(manager => 
            manager.name?.toLowerCase().includes(query) ||
            manager.role?.toLowerCase().includes(query)
        )
        setFilteredManagers(filtered)
    }

    const toggleManager = (manager) => {
        const isSelected = selected.some(m => m._id === manager._id)
        if (isSelected) {
            setSelected(selected.filter(m => m._id !== manager._id))
        } else {
            setSelected([...selected, manager])
        }
    }

    const handleSave = () => {
        onSave(selected)
        handleClose()
    }

    const handleClose = () => {
        setSearchQuery('')
        onClose()
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
                id="selectManagersModal"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="selectManagersModalLabel"
                aria-hidden={false}
                style={{ display: 'block' }}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title" id="selectManagersModalLabel">
                                Select Managers
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleClose}
                            />
                        </div>
                        <div className="modal-body">
                            {/* Search Input */}
                            <div className="form-group mb-4">
                                <div className="position-relative">
                                    <FiSearch className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 10 }} />
                                    <input
                                        type="text"
                                        className="form-control ps-5"
                                        placeholder="Search by name or role..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Managers List */}
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredManagers.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    {searchQuery ? 'No managers found matching your search' : 'No managers available'}
                                </div>
                            ) : (
                                <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {filteredManagers.map((manager) => {
                                        const isSelected = selected.some(m => m._id === manager._id)
                                        return (
                                            <div
                                                key={manager._id}
                                                className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                                                onClick={() => toggleManager(manager)}
                                                style={{ 
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected ? '#008ae41a' : 'transparent',
                                                    color: isSelected ? '#008ce4' : '#212529'
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="avatar-text avatar-md bg-soft-primary text-primary">
                                                            {getInitials(manager.name)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{manager.name || 'Unknown'}</div>
                                                            <div className="fs-12 text-muted">{manager.role || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleManager(manager)}
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
                        <div className="modal-footer border-top">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
        </>
    )
}

export default SelectManagersModal

