"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: number
  message: string | null
  image_url: string | null
  timestamp: string
  visible: boolean
  name?: string
  display_time?: number
  max_repetitions?: number
  current_repetitions?: number
}

interface ScreenConfig {
  enabled: boolean
  display_time: number
  transition_effect: string
  image_size_percent: number
  enable_movement: boolean
  enable_effects: boolean
  effect_type: string
  random_transitions: boolean
}

interface TitleConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

interface ZocalConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

// Colores para el fondo cambiante
const backgroundColors = [
  "from-purple-900 to-black",
  "from-blue-900 to-purple-900",
  "from-indigo-900 to-blue-900",
  "from-violet-900 to-indigo-900",
  "from-fuchsia-900 to-violet-900",
  "from-pink-900 to-fuchsia-900",
  "from-rose-900 to-pink-900",
  "from-red-900 to-rose-900",
]

// Variantes para las transiciones
const transitionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -10, scale: 0.8 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.8 },
  },
}

// Configuración por defecto
const defaultScreenConfig: ScreenConfig = {
  enabled: true,
  display_time: 10000,
  transition_effect: "fadeIn",
  image_size_percent: 80,
  enable_movement: true,
  enable_effects: false,
  effect_type: "none",
  random_transitions: false,
}

const defaultTitleConfig: TitleConfig = {
  text: "INTERACTIVE SCREEN & MUSIC",
  image_url: null,
  left_image_url: null,
  right_image_url: null,
  enabled: true,
  image_size_percent: 80,
  is_static: false,
}

const defaultZocalConfig: ZocalConfig = {
  text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
  image_url: null,
  left_image_url: null,
  right_image_url: null,
  enabled: true,
  image_size_percent: 80,
  is_static: false,
}

export default function PantallaPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [screenConfig, setScreenConfig] = useState<ScreenConfig>(defaultScreenConfig)
  const [titleConfig, setTitleConfig] = useState<TitleConfig>(defaultTitleConfig)
  const [zocalConfig, setZocalConfig] = useState<ZocalConfig>(defaultZocalConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bgColorIndex, setBgColorIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Referencias para el título y zócalo
  const titleRef = useRef<HTMLDivElement>(null)
  const zocalRef = useRef<HTMLDivElement>(null)
  const [titlePosition, setTitlePosition] = useState(0)
  const [zocalPosition, setZocalPosition] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar configuración de pantalla
  const loadScreenConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/screen/config")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setScreenConfig({
            ...defaultScreenConfig,
            ...data.config,
          })
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }
  }, [])

  // Cargar configuración del título
  const loadTitleConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/screen/title")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setTitleConfig(data.config)
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración del título:", error)
    }
  }, [])

  // Cargar configuración del zócalo
  const loadZocalConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/screen/zocal")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setZocalConfig(data.config)
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración del zócalo:", error)
    }
  }, [])

  // Cargar mensajes
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/screen")
      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
          setError(null)
        } else {
          setMessages([])
          setError("No hay mensajes disponibles")
        }
      } else {
        setError("Error al cargar mensajes")
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error)
      setError("Error al conectar con el servidor")
    }
  }, [])

  // Incrementar contador de repeticiones
  const incrementRepetitionCount = useCallback(async (messageId: number) => {
    try {
      await fetch(`/api/messages/mark-displayed?id=${messageId}`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error al incrementar repetición:", error)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadScreenConfig(), loadTitleConfig(), loadZocalConfig(), loadMessages()])
      setLoading(false)
    }

    initializeData()

    // Recargar datos periódicamente
    const interval = setInterval(() => {
      loadScreenConfig()
      loadTitleConfig()
      loadZocalConfig()
      loadMessages()
    }, 30000) // Cada 30 segundos

    return () => {
      clearInterval(interval)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [loadScreenConfig, loadTitleConfig, loadZocalConfig, loadMessages])

  // Cambiar mensaje actual periódicamente
  useEffect(() => {
    if (messages.length === 0 || !screenConfig.enabled) return

    const changeMessage = () => {
      // Iniciar transición
      setIsTransitioning(true)

      // Incrementar el contador de repeticiones para el mensaje actual
      const currentMessage = messages[currentIndex]
      if (currentMessage && currentMessage.id) {
        incrementRepetitionCount(currentMessage.id)
      }

      // Cambiar mensaje después de un breve retraso
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length)
        setIsTransitioning(false)
      }, 500) // Duración de la transición
    }

    // Usar el tiempo de visualización específico del mensaje si existe
    const currentMessage = messages[currentIndex]
    const displayTime =
      currentMessage && currentMessage.display_time ? currentMessage.display_time * 1000 : screenConfig.display_time

    const interval = setInterval(changeMessage, displayTime)

    return () => clearInterval(interval)
  }, [currentIndex, messages, screenConfig.enabled, screenConfig.display_time, incrementRepetitionCount])

  // Cambiar color de fondo periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setBgColorIndex((prevIndex) => (prevIndex + 1) % backgroundColors.length)
    }, 15000) // Cambiar cada 15 segundos

    return () => clearInterval(interval)
  }, [])

  // Efecto para manejar el movimiento del título
  useEffect(() => {
    if (!titleConfig.enabled || titleConfig.is_static || !screenConfig.enable_movement) {
      return
    }

    const titleElement = titleRef.current
    if (!titleElement) return

    const titleWidth = titleElement.scrollWidth
    const containerWidth = titleElement.clientWidth

    if (titleWidth <= containerWidth) return

    const animateTitlePosition = () => {
      setTitlePosition((prev) => {
        const newPosition = prev - 1
        return newPosition < -titleWidth ? containerWidth : newPosition
      })
    }

    const titleAnimationInterval = setInterval(animateTitlePosition, 30)

    return () => {
      clearInterval(titleAnimationInterval)
    }
  }, [titleConfig.enabled, titleConfig.is_static, screenConfig.enable_movement])

  // Efecto para manejar el movimiento del zócalo
  useEffect(() => {
    if (!zocalConfig.enabled || zocalConfig.is_static || !screenConfig.enable_movement) {
      return
    }

    const zocalElement = zocalRef.current
    if (!zocalElement) return

    const zocalWidth = zocalElement.scrollWidth
    const containerWidth = zocalElement.clientWidth

    if (zocalWidth <= containerWidth) return

    const animateZocalPosition = () => {
      setZocalPosition((prev) => {
        const newPosition = prev - 1
        return newPosition < -zocalWidth ? containerWidth : newPosition
      })
    }

    const zocalAnimationInterval = setInterval(animateZocalPosition, 30)

    return () => {
      clearInterval(zocalAnimationInterval)
    }
  }, [zocalConfig.enabled, zocalConfig.is_static, screenConfig.enable_movement])

  // Obtener variantes de animación según el efecto seleccionado
  const getAnimationVariants = useCallback(() => {
    const transition = screenConfig.random_transitions
      ? Object.keys(transitionVariants)[Math.floor(Math.random() * Object.keys(transitionVariants).length)]
      : screenConfig.transition_effect

    return transitionVariants[transition as keyof typeof transitionVariants] || transitionVariants.fadeIn
  }, [screenConfig.transition_effect, screenConfig.random_transitions])

  // Renderizar mensaje actual
  const renderCurrentMessage = () => {
    if (messages.length === 0) return null

    const currentMessage = messages[currentIndex]
    const animationVariants = getAnimationVariants()

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          exit={animationVariants.exit}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center"
        >
          {currentMessage.image_url && (
            <div className="relative w-full max-w-md h-48 md:h-64 mb-4">
              <Image
                src={currentMessage.image_url || "/placeholder.svg"}
                alt="Imagen del mensaje"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}

          {currentMessage.message && (
            <div className="text-center p-6 bg-black/70 rounded-lg">
              <p className="text-2xl md:text-4xl font-bold text-white mb-3">{currentMessage.message}</p>
              <p className="text-lg md:text-xl text-purple-300">- {currentMessage.name || "Anónimo"}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${backgroundColors[bgColorIndex]} flex items-center justify-center transition-colors duration-1000`}
      >
        <div className="text-white text-2xl">Cargando mensajes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${backgroundColors[bgColorIndex]} flex items-center justify-center transition-colors duration-1000`}
      >
        <div className="text-white text-2xl text-center p-6 bg-black/50 rounded-lg">
          <p>{error}</p>
          <p className="text-sm mt-4">Los mensajes aparecerán automáticamente cuando estén disponibles</p>
        </div>
      </div>
    )
  }

  if (!screenConfig.enabled) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${backgroundColors[bgColorIndex]} flex items-center justify-center transition-colors duration-1000`}
      >
        <div className="text-white text-2xl text-center p-6 bg-black/50 rounded-lg">
          <p>La pantalla está desactivada</p>
        </div>
      </div>
    )
  }

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${backgroundColors[bgColorIndex]} relative overflow-hidden transition-colors duration-1000`}
    >
      {/* Título superior */}
      {titleConfig.enabled && (
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 p-2 overflow-hidden">
          <div
            ref={titleRef}
            className="flex items-center justify-center space-x-4 whitespace-nowrap"
            style={{
              transform:
                titleConfig.is_static || !screenConfig.enable_movement ? "none" : `translateX(${titlePosition}px)`,
            }}
          >
            {titleConfig.left_image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${titleConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image
                  src={titleConfig.left_image_url || "/placeholder.svg"}
                  alt="Imagen izquierda"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <h1 className="text-xl md:text-2xl font-bold text-white px-4">{titleConfig.text}</h1>

            {titleConfig.image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${titleConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image src={titleConfig.image_url || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
              </div>
            )}

            {titleConfig.right_image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${titleConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image
                  src={titleConfig.right_image_url || "/placeholder.svg"}
                  alt="Imagen derecha"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh]">
        {messages.length === 0 ? (
          <p className="text-2xl text-gray-400">No hay mensajes para mostrar</p>
        ) : (
          renderCurrentMessage()
        )}
      </div>

      {/* Zócalo inferior */}
      {zocalConfig.enabled && (
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 p-2 overflow-hidden">
          <div
            ref={zocalRef}
            className="flex items-center justify-center space-x-4 whitespace-nowrap"
            style={{
              transform:
                zocalConfig.is_static || !screenConfig.enable_movement ? "none" : `translateX(${zocalPosition}px)`,
            }}
          >
            {zocalConfig.left_image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${zocalConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image
                  src={zocalConfig.left_image_url || "/placeholder.svg"}
                  alt="Imagen izquierda"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <p className="text-lg md:text-xl text-white px-4">{zocalConfig.text}</p>

            {zocalConfig.image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${zocalConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image src={zocalConfig.image_url || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
              </div>
            )}

            {zocalConfig.right_image_url && (
              <div
                className="relative shrink-0"
                style={{
                  height: "40px",
                  width: `${zocalConfig.image_size_percent}px`,
                  maxWidth: "100px",
                }}
              >
                <Image
                  src={zocalConfig.right_image_url || "/placeholder.svg"}
                  alt="Imagen derecha"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

