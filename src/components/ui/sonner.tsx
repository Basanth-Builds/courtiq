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
            'group toast !bg-[#2D3142] !text-white !border-white/10 !shadow-lg',
          description: '!text-white/60',
          actionButton: '!bg-[#A8D634] !text-[#1E2030] !font-semibold',
          cancelButton: '!bg-white/10 !text-white/60',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
