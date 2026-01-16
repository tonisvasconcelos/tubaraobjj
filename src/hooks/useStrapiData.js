import { useState, useEffect } from 'react'

/**
 * Custom hook for fetching Strapi data
 * @param {Function} fetchFunction - Function that returns a promise
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error }
 */
export const useStrapiData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchFunction()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
          console.error('Error fetching data:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error }
}

export default useStrapiData
