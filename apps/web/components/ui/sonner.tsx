'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#2D3142] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-white/60',
          actionButton: 'group-[.toast]:bg-[#A8D634] group-[.toast]:text-[#1E2030]',
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white/60',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
