// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1011'

export const homePost = async (endpoint, payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    return {
      status: response.ok,
      data: data
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      status: false,
      data: { msg: error.message || 'An error occurred' }
    }
  }
}

export const homeGet = async (endpoint, params = {}) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const queryString = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    
    const data = await response.json()
    
    return {
      status: response.ok,
      data: data
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      status: false,
      data: { msg: error.message || 'An error occurred' }
    }
  }
}

export const homePut = async (endpoint, payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    return {
      status: response.ok,
      data: data
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      status: false,
      data: { msg: error.message || 'An error occurred' }
    }
  }
}

export const homeDelete = async (endpoint, payload = null) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const fetchOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    }
    
    // Add body if payload is provided
    if (payload) {
      fetchOptions.body = JSON.stringify(payload)
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)
    
    const data = await response.json()
    
    return {
      status: response.ok,
      data: data
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      status: false,
      data: { msg: error.message || 'An error occurred' }
    }
  }
}

