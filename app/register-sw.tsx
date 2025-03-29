"use client"

import { useEffect } from "react"

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").then(
          (registration) => {
            console.log("Service Worker registrado con éxito:", registration.scope)
          },
          (err) => {
            console.log("Service Worker falló al registrarse:", err)
          },
        )
      })
    }
  }, [])

  return null
}

