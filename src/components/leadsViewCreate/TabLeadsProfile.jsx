import React from 'react'
import getIcon from '@/utils/getIcon';

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function to get source icon
const getSourceIconName = (source) => {
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

const TabLeadsProfile = ({ leadData }) => {
    if (!leadData) {
        return (
            <div className="tab-pane fade show active" id="profileTab" role="tabpanel">
                <div className="alert alert-warning">No lead data available</div>
            </div>
        );
    }

    // Build lead info data from API response
    const leadInfoData = [
        {
            title: 'Name',
            content: <a href="#">{leadData.name || 'N/A'}</a>,
        },
        {
            title: 'Email',
            content: <a href={`mailto:${leadData.email}`}>{leadData.email || 'N/A'}</a>,
        },
        {
            title: 'Phone',
            content: <a href={`tel:${leadData.phone}`}>{leadData.phone ? `${leadData.dialCode || ''} ${leadData.phone}` : 'N/A'}</a>,
        },
        {
            title: 'Unique ID',
            content: <span>{leadData.unique_id || 'N/A'}</span>,
        },
        {
            title: 'Serial Number',
            content: <span>{leadData.serial_number || 'N/A'}</span>,
        },
        {
            title: 'Address',
            content: <span>{leadData.address || leadData.per_address || 'N/A'}</span>,
        },
        {
            title: 'City',
            content: <span>{leadData.city || leadData.corr_city || 'N/A'}</span>,
        },
        {
            title: 'State',
            content: <span>{leadData.state || leadData.corr_state || 'N/A'}</span>,
        },
        {
            title: 'Country',
            content: <span>{leadData.country || leadData.corr_country || leadData.countryCode || 'N/A'}</span>,
        },
        {
            title: 'Pincode',
            content: <span>{leadData.pincode || leadData.corr_pincode || 'N/A'}</span>,
        },
    ];

    // Build general info data from API response
    const generalInfoData = [
        {
            title: 'Status',
            icon: 'feather-git-commit',
            text: leadData.lead_status || leadData.User_status || 'N/A',
        },
        {
            title: 'Source',
            icon: getSourceIconName(leadData.source),
            text: leadData.source ? leadData.source.charAt(0).toUpperCase() + leadData.source.slice(1) : 'N/A',
        },
        {
            title: 'Priority',
            icon: 'feather-arrow',
            text: leadData.priority ? leadData.priority.charAt(0).toUpperCase() + leadData.priority.slice(1) : 'N/A',
        },
        {
            title: 'Customer Status',
            icon: 'feather-user',
            text: leadData.customer_status || 'N/A',
        },
        {
            title: 'Created',
            icon: 'feather-clock',
            text: formatDate(leadData.createdAt || leadData.date),
        },
        {
            title: 'Assigned To',
            image: leadData.assigned_to?.profile_image || leadData.assigned_to?.image,
            text: leadData.assigned_to?.name || 'Not Assigned',
        },
    ];
    return (
        <div className="tab-pane fade show active" id="profileTab" role="tabpanel">
            <div className="card card-body lead-info">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">
                        <span className="d-block mb-2">Lead Information :</span>
                        <span className="fs-12 fw-normal text-muted d-block">Following information for your lead</span>
                    </h5>
                    <a href="#" className="btn btn-sm btn-light-brand">Create Invoice</a>
                </div>
                {leadInfoData.map((data, index) => (
                    <Card
                        key={index}
                        title={data.title}
                        content={data.content}
                    />
                ))}
            </div>
            <hr />
            <div className="card card-body general-info">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">
                        <span className="d-block mb-2">General Information :</span>
                        <span className="fs-12 fw-normal text-muted d-block">General information for your lead</span>
                    </h5>
                    <a href="#" className="btn btn-sm btn-light-brand">Edit Lead</a>
                </div>


                {generalInfoData.map((data, index) => (
                    <GeneralCard
                        key={index}
                        title={data.title}
                        icon={data.icon}
                        text={data.text}
                        image={data.image}
                    />
                ))}
                <div className="row mb-4">
                    <div className="col-lg-2 fw-medium">Tags</div>
                    <div className="col-lg-10 hstack gap-1"><a href="#" className="badge bg-soft-primary text-primary">VIP</a><a href="#" className="badge bg-soft-success text-success">High Rated</a><a href="#" className="badge bg-soft-warning text-warning">Promotions</a><a href="#" className="badge bg-soft-danger text-danger">Team</a><a href="#" className="badge bg-soft-teal text-teal">Updates</a></div>
                </div>
                <div className="row mb-4">
                    <div className="col-lg-2 fw-medium">Description</div>
                    <div className="col-lg-10 hstack gap-1">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Molestiae, nulla veniam, ipsam nemo autem fugit earum accusantium reprehenderit recusandae in minima harum vitae doloremque quasi aut dolorum voluptate. Minima, deleniti.Lorem ipsum, dolor sit amet consectetur adipisicing elit. Molestiae, nulla veniam, ipsam nemo autem fugit earum accusantium reprehenderit recusandae in minima harum vitae doloremque quasi aut dolorum voluptate.</div>
                </div>
            </div>
        </div>
    )
}

export default TabLeadsProfile

const Card = ({ title, content }) => {
    return (
        <div className="row mb-4">
            <div className="col-lg-2 fw-medium">{title}</div>
            <div className="col-lg-10">{content}</div>
        </div>
    );
};

const GeneralCard = ({ title, icon, text, image }) => {
    return (
        <div className="row mb-4">
            <div className="col-lg-2 fw-medium">{title}</div>
            <div className="col-lg-10 hstack gap-1">
                <a href="#" className="hstack gap-2">
                    {icon && (
                        <div className="avatar-text avatar-sm">
                            {getIcon(icon)}
                        </div>
                    )}
                    {image && (
                        <div className="avatar-image avatar-sm">
                            <img src={image} alt="" className="img-fluid" />
                        </div>
                    )}
                    <span>{text}</span>
                </a>
            </div>
        </div>
    );
};
