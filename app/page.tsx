import Link from "next/link";
import { redirect } from 'next/navigation'
import { getUser, getUserProfile, getRoleRedirectPath } from '@/lib/auth'
import { SimpleThemeToggle } from '@/components/theme-toggle'

export default async function Home() {
  // Check if user is already authenticated
  const user = await getUser()
  
  if (user) {
    const profile = await getUserProfile()
    
    if (!profile || !profile.role) {
      redirect('/select-role')
    }

    const redirectPath = getRoleRedirectPath(profile.role)
    redirect(redirectPath)
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white mb-6">
              Smart Pickleball
              <span className="block text-blue-600 dark:text-blue-400">
                Tournament Management
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              CourtIQ is a smart, web-based pickleball tournament management platform that streamlines scoring, fixtures, scheduling, and real-time updates. It replaces outdated paper workflows and brings accuracy, transparency, and efficiency to competitive pickleball events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors inline-block"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 text-base font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-400 transition-colors inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-t border-zinc-200 dark:border-zinc-800"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
              Features
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Everything you need to manage pickleball tournaments efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Real-Time Scoring
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Live score updates and match tracking that works across all devices for referees and spectators.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-xl">�</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Fixtures & Scheduling
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Automated tournament bracket generation, match scheduling, and fixture management.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-xl">�</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Responsive Web App
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Single platform that works seamlessly across devices for organizers, players, and spectators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
            Ready to streamline your tournaments?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Join tournament organizers and referees who are using CourtIQ to manage pickleball events with accuracy and transparency.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            Login to CourtIQ
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-zinc-600 dark:text-zinc-400">
              <p>&copy; 2025 CourtIQ. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-6">
                <Link
                  href="#"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </div>
              <div className="border-l border-zinc-300 dark:border-zinc-700 pl-6">
                <SimpleThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
