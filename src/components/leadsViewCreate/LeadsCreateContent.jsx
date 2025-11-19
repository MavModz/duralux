'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import SelectDropdown from '@/components/shared/SelectDropdown'
import TextArea from '@/components/shared/TextArea'
import { customerListTagsOptions, leadsGroupsOptions, leadsSourceOptions, leadsStatusOptions, propsalVisibilityOptions, taskAssigneeOptions } from '@/utils/options'
import useLocationData from '@/hooks/useLocationData'
import { currencyOptionsData } from '@/utils/fackData/currencyOptionsData'
import { languagesData } from '@/utils/fackData/languagesData'
import { timezonesData } from '@/utils/fackData/timeZonesData'
import Loading from '@/components/shared/Loading'
import Input from '@/components/shared/Input'
import MultiSelectImg from '@/components/shared/MultiSelectImg'
import MultiSelectTags from '@/components/shared/MultiSelectTags'
import { homePost, homeGet } from '@/utils/api'
import topTost from '@/utils/topTost'
import getIcon from '@/utils/getIcon'



// Service options
const serviceOptions = [
    { value: 'COURSE', label: 'Course' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'PRODUCT', label: 'Product' },
]

// Gender options
const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
]

const LeadsCreateContent = forwardRef((props, ref) => {
    const router = useRouter();
    const { countries, states, cities, loading: locationLoading, error, fetchStates, fetchCities } = useLocationData();
    const leadsTags = customerListTagsOptions
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        // Lead Status section
        status: null,
        source: null,
        tags: [],
        
        // Lead Info section
        name: '',
        email: '',
        phone: '',
        country: null,
        state: null,
        city: null,
        timezone: null,
        languages: [],
        
        // Additional fields for API
        service: null,
        gender: null,
        dob: '',
        pincode: '',
        campaign: null,
        image: '',
        countryCode: 'IN',
        dialCode: '+91',
        personalDetailToggle: false,
        corr_country: '',
        corr_city: '',
        corr_state: '',
    });

    const [campaigns, setCampaigns] = useState([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [leadStatusesLoading, setLeadStatusesLoading] = useState(false);

    // Color mapping for lead statuses
    const getStatusColor = (statusName) => {
        const colorMap = {
            'Open Lead': '#008ce4',
            'Hot Lead': '#ea4d4d',
            'In Progress': '#ffa21d',
            'Converted Lead': '#17c666',
            'Lost Lead': '#64748b'
        };
        return colorMap[statusName] || '#008ce4';
    };

    // Fetch lead statuses on mount
    useEffect(() => {
        const fetchLeadStatuses = async () => {
            try {
                setLeadStatusesLoading(true);
                const response = await homeGet('/leadstatus');
                
                if (response?.status && response?.data?.status && response?.data?.leadstatus) {
                    const statusOptions = response.data.leadstatus
                        .filter(status => !status.is_delete)
                        .map(status => ({
                            value: status.statusname,
                            label: status.statusname,
                            color: getStatusColor(status.statusname)
                        }));
                    setLeadStatuses(statusOptions);
                    
                    // Set "Open Lead" as default status for manual leads
                    const openLeadStatus = statusOptions.find(status => status.value === 'Open Lead');
                    if (openLeadStatus && !formData.status) {
                        setFormData(prev => ({ ...prev, status: openLeadStatus }));
                    }
                }
            } catch (err) {
                console.error('Error fetching lead statuses:', err);
            } finally {
                setLeadStatusesLoading(false);
            }
        };
        
        fetchLeadStatuses();
    }, []);

    // Fetch campaigns on mount
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setCampaignsLoading(true);
                const response = await homeGet('/campaigns');
                
                if (response?.status && response?.data?.status && response?.data?.data) {
                    const campaignOptions = response.data.data.map(campaign => ({
                        value: campaign._id || campaign.id,
                        label: campaign.campaign_name || 'Unnamed Campaign'
                    }));
                    setCampaigns(campaignOptions);
                }
            } catch (err) {
                console.error('Error fetching campaigns:', err);
            } finally {
                setCampaignsLoading(false);
            }
        };
        
        fetchCampaigns();
    }, []);


    // Handle input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle select change
    const handleSelectChange = (field) => (option) => {
        setFormData(prev => ({ ...prev, [field]: option }));
        
        // Auto-fetch states and cities when country is selected
        if (field === 'country' && option?.label) {
            fetchStates(option.label);
            fetchCities(option.label);
        }
    };

    // Submit handler
    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!formData.name || !formData.name.trim()) {
                alert('Name is required. Please fill in the Name field.');
                return;
            }
            
            if (!formData.email || !formData.email.trim()) {
                alert('Email is required. Please fill in the Email field.');
                return;
            }
            
            if (!formData.phone || !formData.phone.trim()) {
                alert('Phone is required. Please fill in the Phone field.');
                return;
            }
            
            if (!formData.campaign || !formData.campaign.value) {
                alert('Campaign is required. Please select a Campaign.');
                return;
            }
            
            setSubmitting(true);
            
            // Get company_id from localStorage
            const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const company_id = userData?.company_id || '';

            if (!company_id) {
                alert('Company ID not found. Please login again.');
                setSubmitting(false);
                return;
            }

            // Prepare payload according to API structure
            const payload = {
                phone: formData.phone || '',
                image: formData.image || '',
                service: formData.service?.value || '',
                city: formData.city?.label || '',
                state: formData.state?.label || '',
                country: formData.country?.label || '',
                gender: formData.gender?.value || '',
                lead_status: formData.status?.value || '',
                campaign: formData.campaign?.value || '',
                corr_country: formData.corr_country || '',
                corr_city: formData.corr_city || '',
                corr_state: formData.corr_state || '',
                personalDetailToggle: formData.personalDetailToggle,
                countryCode: formData.countryCode || 'IN',
                dialCode: formData.dialCode || '+91',
                name: formData.name || '',
                email: formData.email || '',
                dob: formData.dob || '',
                pincode: formData.pincode ? parseInt(formData.pincode) : 0,
                company_id: company_id,
                source: formData.source?.value || 'manual'
            };

            const response = await homePost('/add-leads-manual', payload);

            if (response?.status && response?.data?.status) {
                topTost();
                // Redirect to leads list page after successful creation
                setTimeout(() => {
                    router.push('/admin/leads/list');
                }, 1000);
            } else {
                alert(response?.data?.message || 'Failed to create lead');
            }
        } catch (err) {
            console.error('Error creating lead:', err);
            alert('An error occurred while creating the lead');
        } finally {
            setSubmitting(false);
        }
    };

    // Expose submit handler to parent via ref
    useImperativeHandle(ref, () => ({
        handleSubmit
    }));
            return (
        <>
            {(locationLoading || submitting || leadStatusesLoading || campaignsLoading) && <Loading />}
            <div className="col-lg-12">
                <div className="card stretch stretch-full">
                    <div className="card-body lead-status">
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <h5 className="fw-bold mb-0 me-4">
                                <span className="d-block mb-2">Lead Status :</span>
                                <span className="fs-12 fw-normal text-muted text-truncate-1-line">Typically refers to adding a new potential customer or sales prospect</span>
                            </h5>
                            <a href="#" className="btn btn-sm btn-light-brand">Create Invoice</a>
                        </div>
                        <div className="row">
                            <div className="col-lg-4 mb-4">
                                <label className="form-label">Status</label>
                                <SelectDropdown
                                    options={leadStatuses.length > 0 ? leadStatuses : leadsStatusOptions}
                                    selectedOption={formData.status}
                                    defaultSelect="Open Lead"
                                    onSelectOption={handleSelectChange('status')}
                                />
                            </div>
                            <div className="col-lg-4 mb-4">
                                <label className="form-label">Source</label>
                                <SelectDropdown
                                    options={leadsSourceOptions}
                                    selectedOption={formData.source}
                                    defaultSelect="manual"
                                    onSelectOption={handleSelectChange('source')}
                                />
                            </div>
                            <div className="col-lg-4 mb-4">
                                <label className="form-label">Service</label>
                                <SelectDropdown
                                    options={serviceOptions}
                                    selectedOption={formData.service}
                                    onSelectOption={handleSelectChange('service')}
                                />
                            </div>
                            <div className="col-lg-4 mb-4">
                                <label className="form-label">Campaign <span className="text-danger">*</span></label>
                                <SelectDropdown
                                    options={campaigns}
                                    selectedOption={formData.campaign}
                                    onSelectOption={handleSelectChange('campaign')}
                                />
                            </div>
                            <div className="col-lg-4 mb-4">
                                <label className="form-label">Tags</label>
                                <MultiSelectTags
                                    options={leadsTags}
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>
                    <hr className="mt-0" />
                    <div className="card-body general-info">
                        <div className="mb-5 d-flex align-items-center justify-content-between">
                            <h5 className="fw-bold mb-0 me-4">
                                <span className="d-block mb-2">Lead Info :</span>
                                <span className="fs-12 fw-normal text-muted text-truncate-1-line">General information for your lead</span>
                            </h5>
                            <a href="#" className="btn btn-sm btn-light-brand">Edit Lead</a>
                        </div>
                        <Input
                            icon='feather-user'
                            label={"Name"}
                            labelId={"nameInput"}
                            placeholder={"Name"}
                            name={"name"}
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required={true}
                        />
                        <Input
                            icon='feather-mail'
                            label={"Email"}
                            labelId={"emailInput"}
                            placeholder={"Email"}
                            name={"email"}
                            type={"email"}
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required={true}
                        />
                        <Input
                            icon='feather-phone'
                            label={"Phone"}
                            labelId={"phoneInput"}
                            placeholder={"Phone"}
                            name={"phone"}
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required={true}
                        />
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Gender: </label>
                            </div>
                            <div className="col-lg-8">
                                <SelectDropdown
                                    options={genderOptions}
                                    selectedOption={formData.gender}
                                    onSelectOption={handleSelectChange('gender')}
                                />
                            </div>
                        </div>
                        <Input
                            icon="feather-calendar"
                            label={"Date of Birth"}
                            labelId={"dobInput"}
                            placeholder={"Date of Birth"}
                            name={"dob"}
                            type={"date"}
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                        />
                        <Input
                            icon="feather-map-pin"
                            label={"Pincode"}
                            labelId={"pincodeInput"}
                            placeholder={"Pincode"}
                            name={"pincode"}
                            value={formData.pincode}
                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                        />
                        <Input
                            icon="feather-image"
                            label={"Image URL"}
                            labelId={"imageInput"}
                            placeholder={"Image URL"}
                            name={"image"}
                            value={formData.image}
                            onChange={(e) => handleInputChange('image', e.target.value)}
                        />
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Country: </label>
                            </div>
                            <div className="col-lg-8">
                                <SelectDropdown
                                    options={countries}
                                    selectedOption={formData.country}
                                    defaultSelect="usa"
                                    onSelectOption={handleSelectChange('country')}
                                />
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">State: </label>
                            </div>
                            <div className="col-lg-8">
                                <SelectDropdown
                                    options={states}
                                    selectedOption={formData.state}
                                    defaultSelect={"new-york"}
                                    onSelectOption={handleSelectChange('state')}
                                />
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">City: </label>
                            </div>
                            <div className="col-lg-8">
                                <SelectDropdown
                                    options={cities}
                                    selectedOption={formData.city}
                                    defaultSelect="new-york"
                                    onSelectOption={handleSelectChange('city')}
                                />
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Country Code: </label>
                            </div>
                            <div className="col-lg-8">
                                <div className="input-group">
                                    <div className="input-group-text">{getIcon('feather-globe')}</div>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="countryCodeInput" 
                                        placeholder="Country Code (e.g., IN)"
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Dial Code: </label>
                            </div>
                            <div className="col-lg-8">
                                <div className="input-group">
                                    <div className="input-group-text">{getIcon('feather-phone')}</div>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="dialCodeInput" 
                                        placeholder="Dial Code (e.g., +91)"
                                        name="dialCode"
                                        value={formData.dialCode}
                                        onChange={(e) => handleInputChange('dialCode', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Time Zone: </label>
                            </div>
                            <div className="col-lg-8">
                                <SelectDropdown
                                    options={timezonesData}
                                    selectedOption={formData.timezone}
                                    defaultSelect="Western Europe Time"
                                    onSelectOption={handleSelectChange('timezone')}
                                />
                            </div>
                        </div>
                        <div className="row mb-4 align-items-center">
                            <div className="col-lg-4">
                                <label className="fw-semibold">Languages: </label>
                            </div>
                            <div className="col-lg-8">
                                <MultiSelectTags
                                    options={languagesData}
                                    defaultSelect={[languagesData[25], languagesData[10], languagesData[45]]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
});

LeadsCreateContent.displayName = 'LeadsCreateContent';

export default LeadsCreateContent