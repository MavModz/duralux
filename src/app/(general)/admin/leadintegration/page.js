import React from 'react'
import Link from 'next/link'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import { FiHelpCircle } from 'react-icons/fi'
import Image from 'next/image'

const page = () => {
  const integrationCards = [
    {
      id: 1,
      title: "Meta AD's",
      description: "Seamlessly Fetch Meta campaign leads instantly into your CRM system. Fast, simple & fully automated integration for better results",
      color: "primary",
      icon: "/images/brand/facebook.png",
      route: "/admin/leadintegration/meta"
    },
    {
      id: 2,
      title: "Google Sheets",
      description: "Sync Google Spreadsheet data directly to your CRM. Capture leads instantly and manage them with seamless, automated integration.",
      color: "success",
      icon: "/images/brand/Sheets.png",
      route: "/admin/leadintegration/googlesheets"
    },
    {
      id: 3,
      title: "Google ADWords",
      description: "Fetch leads from Google campaigns using Google Asset Form. Add details in Custom CRM Integration, and it's ready to start instantly.",
      color: "danger",
      icon: "/images/brand/googleads.png",
      route: "/admin/leadintegration/googleads"
    },
    {
      id: 4,
      title: "Lead Form Connect",
      description: "Integrate your custom lead forms and WordPress forms to capture inquiries directly into your CRM, ensuring no lead is ever missed.",
      color: "info",
      icon: "/images/brand/wordPress.png",
      route: "/admin/leadintegration/wordpress"
    }
  ]

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <button className="btn btn-primary">
            Connected Integrations
          </button>
        </div>
      </PageHeader>
      <div className='main-content' style={{ minHeight: '85vh' }}>
        <div className='row'>
          {integrationCards.map((card) => (
            <IntegrationCard
              key={card.id}
              title={card.title}
              description={card.description}
              color={card.color}
              icon={card.icon}
              route={card.route}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}

const IntegrationCard = ({ title, description, color, icon, route }) => {
  return (
    <div className="col-xxl-3 col-xl-6 col-lg-6 col-sm-6">
      <div className="card card-body mb-4 stretch stretch-full">
        <span className={`side-stick bg-${color}`}></span>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            {icon && (
              <Image 
                width={40} 
                height={40} 
                src={icon} 
                alt={title} 
                className="img-fluid" 
                style={{ objectFit: 'contain' }}
              />
            )}
            <h5 className="note-title mb-0">
              {title}
            </h5>
          </div>
          <div className="avatar-text avatar-sm bg-soft-info text-info" style={{ cursor: 'pointer' }}>
            <FiHelpCircle size={16} />
          </div>
        </div>
        <div className="note-content flex-grow-1 mb-4">
          <p className="text-muted note-inner-content" style={{ minHeight: '60px' }}>
            {description}
          </p>
        </div>
        <div className="d-flex align-items-center">
          <Link href={route}>
            <button className="btn btn-primary btn-sm">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default page

