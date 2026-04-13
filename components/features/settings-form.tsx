'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Save, Loader2 } from "lucide-react"

interface SettingsFormProps {
  settingKey: string
  label: string
  description?: string
  defaultValue?: string
  placeholder?: string
  type?: 'text' | 'textarea' | 'url'
}

export function SettingsForm({
  settingKey,
  label,
  description,
  defaultValue = '',
  placeholder,
  type = 'text'
}: SettingsFormProps) {
  const [value, setValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setIsLoading(true)
    setIsSuccess(false)

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: value, updated_at: new Date().toISOString() })
        .eq('key', settingKey)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Gagal menyimpan pengaturan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      
      {type === 'textarea' ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
      )}

      <div className="flex items-center gap-3">
        <Button 
          onClick={handleSave} 
          disabled={isLoading || value === defaultValue}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan
        </Button>

        {isSuccess && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Tersimpan
          </span>
        )}
      </div>
    </div>
  )
}
