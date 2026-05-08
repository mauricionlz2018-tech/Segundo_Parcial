"use client"

import { useEffect } from "react"

export default function InitDB() {
  useEffect(() => {
    async function initDB() {
      try {
        await fetch("/api/init")
      } catch (error) {
        console.error("Error inicializando BD:", error)
      }
    }
    initDB()
  }, [])

  return null
}
