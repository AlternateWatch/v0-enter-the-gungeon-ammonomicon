"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
        },
      })
      if (error) throw error
      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#1a1410]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-[#2a1f1a] border-[#8b6f47]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#d4af37]">Admin Login</CardTitle>
              <CardDescription className="text-[#c9b896]">
                Enter your credentials to access the Ammonomicon admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#d4af37]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@gungeon.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-[#d4af37]">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-[#c9b896]">
                  <Link href="/" className="underline underline-offset-4 hover:text-[#d4af37]">
                    Back to Ammonomicon
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
