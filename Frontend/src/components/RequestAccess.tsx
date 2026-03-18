import { useState } from 'react'

export type RequestAccessStatus =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

type RequestAccessProps = {
  isSubmitting: boolean
  status?: RequestAccessStatus
  onSubmit: (email: string) => void
  onBack: () => void
}

export function RequestAccess({
  isSubmitting,
  status,
  onSubmit,
  onBack,
}: RequestAccessProps) {
  const [email, setEmail] = useState('')
  const isDisabled = isSubmitting

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Request Access</h1>
            <p className="text-sm text-gray-600 mt-1">Request early access before spots run out.</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!email.trim()) return
              onSubmit(email.trim())
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDisabled}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isDisabled || !email.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Request Access'}
            </button>

            {status ? (
              <p
                className={`text-sm ${
                  status.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {status.message}
              </p>
            ) : null}
          </form>
        </div>
      </main>
    </div>
  )
}
