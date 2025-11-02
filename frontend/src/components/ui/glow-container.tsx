"use client"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionStyle,
  type MotionValue,
} from "motion/react"
import { useEffect, useState, type MouseEvent } from "react"

import { cn } from "@/lib/utils"

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>
  "--y": MotionValue<string>
}

interface CardProps {
  className?: string
}

export function GlowContainer({
  className,
  children,
}: CardProps & {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useIsMobile()

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (isMobile) return
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      className={cn(
        "relative w-full h-full rounded-[16px]",
        !isMobile && "glow-container",
      )}
      onMouseMove={handleMouseMove}
      style={
        {
          "--x": useMotionTemplate`${mouseX}px`,
          "--y": useMotionTemplate`${mouseY}px`,
        } as WrapperStyle
      }
    >
      <div
        className={cn(
          "group relative w-full overflow-hidden border border-black/10 dark:border-white/20 bg-background transition duration-300",
          className,
        )}
      >
        {mounted ? children : null}
      </div>
    </motion.div>
  )
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isSmall = window.matchMedia("(max-width: 768px)").matches
    const isMobile = Boolean(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.exec(
        userAgent,
      ),
    )

    // const isDev = process.env.NODE_ENV !== "production"
    // if (isDev) setIsMobile(isSmall || isMobile)
    //
    // setIsMobile(isSmall && isMobile)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(isSmall || isMobile)
  }, [])

  return isMobile
}
