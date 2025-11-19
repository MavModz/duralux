'use client'
import React from 'react'
import { FiLayers, FiUserPlus } from 'react-icons/fi'
import topTost from '@/utils/topTost';

const LeadsCreateHeader = ({ onCreateLead }) => {
  const handleSaveDraft = (e) => {
    e.preventDefault();
    topTost();
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (onCreateLead) {
      onCreateLead();
    }
  };

  return (
    <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
      <a href="#" className="btn btn-light-brand " onClick={handleSaveDraft}>
        <FiLayers size={16} className='me-2'/>
        <span>Save as Draft</span>
      </a>
      <a href="#" className="btn btn-primary " onClick={handleCreateLead}>
        <FiUserPlus size={16} className='me-2'/>
        <span>Create Lead</span>
      </a>
    </div>
  )
}

export default LeadsCreateHeader