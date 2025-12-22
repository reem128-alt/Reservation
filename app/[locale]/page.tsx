import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CalendarDays, Clock, CheckCircle2, Star, ArrowRight } from "lucide-react"
import { TextAnimate } from "@/registry/magicui/text-animate"
import { ShinyButton } from "@/components/ui/shiny-button"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> | { locale: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Reserve</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hover:bg-primary/10">
              <Link href={`/${locale}/auth/login`}>Sign In</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all">
              <Link href={`/${locale}/auth/register`}>Create Account</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">Trusted by 10,000+ users</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
                <TextAnimate animation="blurIn" as="span" duration={1.2}>
                  {"Book Your Perfect "}
                </TextAnimate>
                <TextAnimate animation="blurIn" as="span" className="text-primary" delay={0.6} duration={1.2}>
                  {"Experience"}
                </TextAnimate>
              </h1>

              <TextAnimate
                animation="blurInUp"
                as="p"
                className="text-xl text-muted-foreground leading-relaxed"
                delay={1.0}
                duration={1.4}
              >
                {"From meeting rooms to event spaces, reserve what you need in seconds. Simple, fast, and reliable booking platform for all your needs."}
              </TextAnimate>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-6 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Link href={`/${locale}/auth/register`} className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  <Link href={`/${locale}/auth/login`}>Sign In</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Instant confirmation</span>
                </div>
              </div>
            </div>

            <div className="relative lg:block animate-slide-in-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/10 animate-float-slow">
                <Image
                  src="/meeting-room.webp"
                  alt="Modern meeting room"
                  width={800}
                  height={600}
                  className="w-full h-auto animate-subtle-zoom"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>

              {/* Floating cards with animation */}
              <div className="absolute -bottom-6 -left-6 bg-background rounded-xl shadow-xl p-4 border border-border animate-float">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Quick Booking</div>
                    <div className="text-xs text-muted-foreground">Reserve in 30 seconds</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-background rounded-xl shadow-xl p-4 border border-border animate-float delay-500">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Top Rated</div>
                    <div className="text-xs text-muted-foreground">4.9/5 from 2,500+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <TextAnimate
              as="h2"
              animation="blurInUp"
              by="word"
              startOnView
              once
              className="text-4xl md:text-5xl font-bold mb-4"
              duration={1.1}
            >
              {"Why Choose Reserve?"}
            </TextAnimate>
            <TextAnimate
              as="p"
              animation="blurIn"
              by="word"
              startOnView
              once
              delay={0.15}
              className="text-xl text-muted-foreground"
              duration={1.1}
            >
              {"Everything you need for seamless bookings"}
            </TextAnimate>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "/elegant-conference.webp",
                title: "Premium Spaces",
                description: "Access to the finest meeting rooms and event spaces",
              },
              {
                image: "/smartphone.jpg",
                title: "Easy Booking",
                description: "Book in seconds with our intuitive platform",
              },
              {
                image: "/support-team.jpg",
                title: "24/7 Support",
                description: "Always here to help with your reservations",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-background rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="w-full h-full object-cover animate-subtle-zoom group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Booking?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied users and experience effortless reservations today
          </p>
          <ShinyButton
            
            variant="primary"
            size="md"
            className="shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <Link href={`/${locale}/auth/register`} className="flex items-center gap-2">
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ShinyButton>
        </div>
      </section>
    </div>
  )
}
