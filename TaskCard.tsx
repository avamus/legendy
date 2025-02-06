"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  index: number
  task: string
  isCompleted: boolean
  onCompletion: (index: number, completed: boolean) => void
  isStartButton?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
}

const confettiColors = ["#f8b922", "#5b06be", "#4ade80"]

export const TaskCard: React.FC<TaskCardProps> = ({ index, task, isCompleted, onCompletion, isStartButton }) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStartButton, setShowStartButton] = useState(isStartButton)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationFrame = useRef<number>()

  const createParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    return Array.from({ length: 100 }, () => ({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }))
  }

  const animate = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.current = particles.current.filter((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1

      if (particle.y < canvas.height) {
        ctx.fillStyle = particle.color
        ctx.fillRect(particle.x, particle.y, 4, 4)
        return true
      }
      return false
    })

    if (particles.current.length > 0) {
      animationFrame.current = requestAnimationFrame(animate)
    } else {
      setShowConfetti(false)
    }
  }

  useEffect(() => {
    if (showConfetti) {
      particles.current = createParticles()
      animate()
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [showConfetti, animate]) // Added animate to dependencies

  const handleConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleStartClick = () => {
    handleConfetti()
    setShowStartButton(false)
    setTimeout(() => onCompletion(index, true), 100)
  }

  const crossOutAnimation = "transition-all duration-700 ease-in-out"

  return (
    <Card className="bg-white shadow-md transition-all duration-300 rounded-xl hover:shadow-lg">
      <CardContent className="p-5 relative">
        {showConfetti && (
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" width={300} height={100} />
        )}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-grow">
              <div className="flex flex-col">
                <h4
                  className={cn(
                    "font-bold text-lg",
                    crossOutAnimation,
                    isCompleted
                      ? "text-[#4ade80] line-through opacity-80 transform scale-100 rotate-1"
                      : "text-[#5b06be] transform scale-100",
                  )}
                >
                  {task}
                </h4>
              </div>
            </div>
            <div className="flex items-center justify-center w-24">
              {isStartButton && !isCompleted ? (
                <Button
                  onClick={() => {
                    handleConfetti()
                    onCompletion(index, true)
                  }}
                  className="bg-[#f8b922] hover:bg-[#e5a91f] text-white rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Start
                </Button>
              ) : (
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    if (checked === true && !isCompleted) {
                      handleConfetti()
                    }
                    setTimeout(() => onCompletion(index, checked === true), 100)
                  }}
                  className={cn(
                    "h-8 w-8 border-2 rounded-md transition-all duration-300",
                    "data-[state=checked]:bg-[#f8b922] data-[state=checked]:border-[#f8b922]",
                    "border-[#f8b922] hover:border-[#e5a91f] hover:shadow-[0_0_15px_rgba(248,185,34,0.3)]",
                    "data-[state=checked]:hover:bg-[#e5a91f] data-[state=checked]:hover:border-[#e5a91f]",
                    "data-[state=checked]:hover:shadow-[0_0_15px_rgba(248,185,34,0.3)]",
                    "flex items-center justify-center",
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
