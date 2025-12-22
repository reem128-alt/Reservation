"use client"

import React from "react"
import { motion, type MotionProps } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const animationProps: MotionProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

const shinyButtonVariants = cva(
  "relative cursor-pointer rounded-lg border font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_var(--primary)/10%]",
  {
    variants: {
      variant: {
        default: "",
        primary: "bg-primary border-primary/20 hover:bg-primary/90",
        secondary: "bg-secondary border-border hover:bg-secondary/80",
        toolbar: "min-w-[160px] border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10",
      },
      size: {
        default: "px-6 py-2",
        md: "px-6 py-4",
        lg: "px-10 py-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const shinyButtonContentVariants = cva(
  "relative z-20 block size-full text-sm tracking-wide",
  {
    variants: {
      variant: {
        default: "text-[rgb(0,0,0,65%)] uppercase dark:font-light dark:text-[rgb(255,255,255,90%)]",
        primary: "text-primary-foreground normal-case dark:text-primary-foreground",
        secondary: "text-secondary-foreground normal-case dark:text-secondary-foreground",
        toolbar: "text-primary normal-case flex items-center justify-center gap-2 dark:text-primary",
      },
      size: {
        default: "",
        md: "text-xl",
        lg: "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ShinyButtonProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps,
    VariantProps<typeof shinyButtonVariants> {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  disabled?: boolean
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, contentClassName, variant, size, ...props }, ref) => {
  const shouldMaskText = variant == null || variant === "default"
  const shouldShowInnerShine = !shouldMaskText

  return (
    <motion.button
      ref={ref}
      className={cn(
        shinyButtonVariants({ variant, size }),
        className
      )}
      {...animationProps}
      {...props}
    >
      {shouldShowInnerShine ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] opacity-30"
          style={{
            maskImage:
              "linear-gradient(-75deg,transparent calc(var(--x) + 20%),#000 calc(var(--x) + 30%),transparent calc(var(--x) + 100%))",
            WebkitMaskImage:
              "linear-gradient(-75deg,transparent calc(var(--x) + 20%),#000 calc(var(--x) + 30%),transparent calc(var(--x) + 100%))",
            backgroundImage:
              "linear-gradient(-75deg,transparent calc(var(--x) + 20%),rgba(255,255,255,0.55) calc(var(--x) + 25%),transparent calc(var(--x) + 100%))",
            mixBlendMode: "overlay",
          }}
        />
      ) : null}
      <span
        className={cn(shinyButtonContentVariants({ variant, size }), contentClassName)}
        style={
          shouldMaskText
            ? {
                maskImage:
                  "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
              }
            : undefined
        }
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  )
})

ShinyButton.displayName = "ShinyButton"
