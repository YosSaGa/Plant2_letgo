"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Send, Users, ArrowRight } from "lucide-react"

// Clean Brand SVG Icons
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
)

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export interface FooterdemoProps {
  onOpenTeam?: () => void;
  onStart?: () => void;
  onPlantInfo?: () => void;
  onAdmin?: () => void;
}

function Footerdemo({ onOpenTeam, onStart, onPlantInfo, onAdmin }: FooterdemoProps) {
  const [subscribed, setSubscribed] = React.useState(false)
  const [email, setEmail] = React.useState("")

  React.useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setTimeout(() => setSubscribed(false), 3000)
    setEmail("")
  }

  return (
    <footer 
      className="footer-scoped relative bg-background text-foreground transition-colors duration-300"
      style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
    >
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Newsletter / Stay Connected */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">Stay Connected</h2>
            <p className="mb-6 text-muted-foreground text-sm leading-relaxed">
              รับเคล็ดลับการปลูกผักสวนครัว อัปเดตฟีเจอร์ใหม่ และคำแนะนำดูแลพืชอัจฉริยะจาก PlookPloen
            </p>
            <form className="relative" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="กรอกอีเมลของคุณ..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 backdrop-blur-sm bg-background text-foreground"
                style={{ border: '1px solid rgba(0, 0, 0, 0.15)', borderRadius: '999px' }}
                required
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:scale-105"
                style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                ✨ ขอบคุณที่ติดตาม! เราจะส่งข่าวสารที่มีประโยชน์ให้คุณ
              </p>
            )}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          </div>

          {/* Column 2: Quick Links & Team Link */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Links</h3>
            <nav className="space-y-2.5 text-sm">
              <a href="/" className="block transition-colors hover:text-primary">
                Home (หน้าแรก)
              </a>
              
              {/* Highlighted Link to OUR CREATIVE TEAM */}
              <button
                type="button"
                onClick={onOpenTeam ? onOpenTeam : () => { window.location.href = '/team'; }}
                className="group flex items-center gap-2 text-left font-semibold text-primary transition-all hover:translate-x-1 bg-transparent border-0 cursor-pointer p-0"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>O U R CREATIVE TEAM</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {onStart && (
                <button
                  type="button"
                  onClick={onStart}
                  className="block text-left transition-colors hover:text-primary bg-transparent border-0 cursor-pointer p-0 text-foreground"
                >
                  แปลงปลูกของฉัน
                </button>
              )}
              {onPlantInfo && (
                <button
                  type="button"
                  onClick={onPlantInfo}
                  className="block text-left transition-colors hover:text-primary bg-transparent border-0 cursor-pointer p-0 text-foreground"
                >
                  คู่มือและคำแนะนำพืช
                </button>
              )}
              {onAdmin && (
                <button
                  type="button"
                  onClick={onAdmin}
                  className="block text-left transition-colors hover:text-primary bg-transparent border-0 cursor-pointer p-0 text-foreground"
                >
                  ระบบจัดการแอดมิน
                </button>
              )}
              <a href="/system-test" className="block transition-colors hover:text-primary">
                System Testing Suite
              </a>
            </nav>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">🌿 PlookPloen Innovation Lab</p>
              <p>สุราษฎร์ธานี, ประเทศไทย</p>
              <p>Email: contact@plookploen.demo</p>
              <p>Support: ตลอด 24 ชม. ผ่าน AI Assistant</p>
            </address>
          </div>

          {/* Column 4: Follow Us & Theme Toggle */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Follow Us</h3>
            <div className="mb-6 flex space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      style={{ border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent' }}
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      style={{ border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent' }}
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on X (Twitter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      style={{ border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent' }}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      style={{ border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent' }}
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-12 flex flex-col items-center justify-between gap-4 pt-8 text-center md:flex-row"
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
        >
          <p className="text-sm text-muted-foreground">
            © 2026 PlookPloen (ปลูกเพลิน). All rights reserved. Created by YOSS & JAME.
          </p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <button 
              type="button" 
              onClick={onOpenTeam ? onOpenTeam : () => { window.location.href = '/team'; }}
              className="transition-colors hover:text-primary font-medium bg-transparent border-0 cursor-pointer p-0 text-muted-foreground"
            >
              Our Team
            </button>
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Cookie Settings
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
