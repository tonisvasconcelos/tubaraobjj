import axios from 'axios'

const API_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api'
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
  },
})

// Helper function to get Strapi media URL
export const getMediaUrl = (media) => {
  if (!media) return null
  if (typeof media === 'string') return media
  if (media.data) {
    const baseUrl = API_URL.replace('/api', '')
    return `${baseUrl}${media.data.attributes.url}`
  }
  return null
}

// Company Info (Single Type)
export const getCompanyInfo = async () => {
  try {
    const response = await api.get('/company-info?populate=*')
    return response.data.data
  } catch (error) {
    console.error('Error fetching company info:', error)
    return null
  }
}

// Hero Cards (Collection Type)
export const getHeroCards = async () => {
  try {
    const response = await api.get('/hero-cards?populate=*&sort=order:asc&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching hero cards:', error)
    return []
  }
}

// About Section (Single Type)
export const getAboutSection = async () => {
  try {
    const response = await api.get('/about-section?populate=*')
    return response.data.data
  } catch (error) {
    console.error('Error fetching about section:', error)
    return null
  }
}

// Programmes (Collection Type)
export const getProgrammes = async () => {
  try {
    const response = await api.get('/programmes?populate=*&sort=order:asc&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return []
  }
}

// Class Schedules (Collection Type)
export const getClassSchedules = async () => {
  try {
    const response = await api.get('/class-schedules?populate=*&sort=dayOfWeek:asc&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching class schedules:', error)
    return []
  }
}

// Team Members (Collection Type)
export const getTeamMembers = async () => {
  try {
    const response = await api.get('/team-members?populate=*&sort=order:asc&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

// Testimonials/Highlights (Collection Type)
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials?populate=*&sort=order:asc&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

// News (Collection Type)
export const getNews = async (limit = 10) => {
  try {
    const response = await api.get(`/news?populate=*&sort=publishedAt:desc&filters[isPublished][$eq]=true&pagination[limit]=${limit}`)
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

// Store Items (Collection Type)
export const getStoreItems = async () => {
  try {
    const response = await api.get('/store-items?populate=*&filters[isActive][$eq]=true')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching store items:', error)
    return []
  }
}

// Newsletter Subscription (Create)
export const subscribeNewsletter = async (data) => {
  try {
    const response = await api.post('/newsletter-subscriptions', {
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subscribedAt: new Date().toISOString(),
        isActive: true,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    throw error
  }
}

export default api
