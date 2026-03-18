import { useState } from 'react'
import axios from 'axios'
import {
  SummaryHeader,
  CleanupBuckets,
  CategoryToggles,
  SafetyFeatures,
  ConfirmationModal,
  ProgressIndicator,
  RequestAccess,
  type RequestAccessStatus,
  type CleanupBucket,
  type CategoryToggle,
} from './components'
import './App.css'

function App() {
  const [selectedBucket, setSelectedBucket] = useState<CleanupBucket | null>(null)
  const [excludeStarred, setExcludeStarred] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [view, setView] = useState<'home' | 'request'>('home')
  const [requestStatus, setRequestStatus] = useState<RequestAccessStatus | { type: 'idle' }>({ type: 'idle' })
  const [isRequesting, setIsRequesting] = useState(false)

  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({})

  const cleanupBuckets: CleanupBucket[] = [
    {
      id: 'older_than_1y',
      label: 'Deep Clean',
      description: 'Emails older than 1 year',
      query: 'older_than:1y -is:starred',
      maxResults: 20,
      visual_style: 'danger-red',
      estimated_count: '2,450',
      size_reclaimed: '850 MB',
    },
    {
      id: 'older_than_6m',
      label: 'Seasonal Sweep',
      description: 'Emails older than 6 months',
      query: 'older_than:6m -is:starred',
      maxResults: 20,
      visual_style: 'warning-orange',
      estimated_count: '1,120',
      size_reclaimed: '420 MB',
    },
  ]

  const categories: CategoryToggle[] = [
    { label: 'Promotions', default_on: true, category: 'category:promotions' },
    { label: 'Social Updates', default_on: true, category: 'category:social' },
    { label: 'Newsletters', default_on: false, category: 'label:newsletters' },
  ]

  const statusMessages = ['Scanning Gmail...', 'Filtering starred items...', 'Sweeping...']

  const handleBucketSelect = (bucket: CleanupBucket) => {
    setSelectedBucket(bucket)
  }

  const handleCategoryToggle = (label: string, isEnabled: boolean) => {
    setSelectedCategories((prev) => ({ ...prev, [label]: isEnabled }))
  }

  const handleRequestAccess = async (email: string) => {
    console.log('Request access for', email)

    setRequestStatus({ type: 'idle' })
    setIsRequesting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      axios.post('http://localhost:3000/auth/request',{email})
      setRequestStatus({
        type: 'success',
        message: 'Thanks! If there is a spot available, you will receive an email.'      })
    } catch (error) {
      console.error('Request access failed', error)
      setRequestStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setIsRequesting(false)
    }
  }

  const handleSweep = () => {
    if (selectedBucket) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmSweep = async () => {
    setShowConfirmation(false)
    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))
      // Here you would call your backend API to perform the actual sweep
      console.log('Sweep completed', {
        bucket: selectedBucket,
        excludeStarred,
        selectedCategories,
      })
    } catch (error) {
      console.error('Sweep failed', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getTimeframeLabel = () => {
    if (selectedBucket?.id === 'older_than_1y') return 'past year'
    if (selectedBucket?.id === 'older_than_6m') return 'past 6 months'
    return 'selected period'
  }

  if (view === 'request') {
    return (
      <RequestAccess
        isSubmitting={isRequesting}
        status={requestStatus.type === 'idle' ? undefined : requestStatus}
        onSubmit={handleRequestAccess}
        onBack={() => setView('home')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Email Sweep</h1>
            <p className="text-sm text-gray-600 mt-1">Powered by Google OAuth 2.0</p>
          </div>

          <div className="flex flex-col-reverse items-center gap-3 pt-5">
            <span className="text-sm text-gray-600">
              Limited Spaces
            </span>
            <button
              onClick={() => {
                setView('request')
                setRequestStatus({ type: 'idle' })
              }}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Request Access
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary Header */}
        <SummaryHeader />

        {/* Cleanup Buckets */}
        <CleanupBuckets
          buckets={cleanupBuckets}
          onSelect={handleBucketSelect}
          selectedId={selectedBucket?.id}
        />

        {/* Category Toggles */}
        <CategoryToggles categories={categories} onToggle={handleCategoryToggle} />

        {/* Safety Features */}
        <SafetyFeatures
          excludeStarred={excludeStarred}
          onToggleExcludeStarred={setExcludeStarred}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={handleSweep}
            disabled={!selectedBucket || isProcessing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isProcessing ? 'Processing...' : 'Start Cleanup'}
          </button>
          <button
            onClick={() => setSelectedBucket(null)}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select a cleanup option that matches your needs, configure your safety preferences, 
                then confirm to delete the selected emails. Protected emails will never be affected.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Privacy & Security</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Email Sweep uses Google OAuth 2.0 for secure authentication. We only process emails 
                matching your criteria and never store your data on our servers.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmation}
        count={selectedBucket?.estimated_count || '0'}
        timeframe={getTimeframeLabel()}
        onConfirm={handleConfirmSweep}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isProcessing}
      />

      <ProgressIndicator isActive={isProcessing} statusMessages={statusMessages} />
    </div>
  )
}

export default App
