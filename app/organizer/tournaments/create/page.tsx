'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateTournament() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    dateStart: '',
    dateEnd: ''
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.dateStart || !formData.dateEnd) {
      toast.error('Please fill in all required fields')
      return
    }

    if (new Date(formData.dateStart) > new Date(formData.dateEnd)) {
      toast.error('End date must be after start date')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          location: formData.location,
          date_start: formData.dateStart,
          date_end: formData.dateEnd,
          organizer: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Tournament created successfully!')
      router.push(`/organizer/tournaments/${data.id}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout role="organizer">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/organizer/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Tournament</h1>
            <p className="text-muted-foreground">Set up a new tournament event</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>
              Enter the basic information for your tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tournament Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Summer Championship 2024"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Central Sports Complex"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateStart}
                    onChange={(e) => handleInputChange('dateStart', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateEnd}
                    onChange={(e) => handleInputChange('dateEnd', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/organizer/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="athletic-button"
                >
                  {loading ? 'Creating...' : 'Create Tournament'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}