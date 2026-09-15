import { useEffect, useState } from "react";
import axios from "axios";
import {
  SummaryHeader,
  CleanupBuckets,
  CategoryToggles,
  SafetyFeatures,
  ConfirmationModal,
  ProgressIndicator,
  RequestAccess,
  StatusBanner,
  type RequestAccessStatus,
  type CleanupBucket,
  type CategoryToggle,
} from "./components";
import { API_BASE_URL, apiFetch } from "./config/api";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

/**
 * Main dashboard — orchestrates the full cleanup flow:
 *   1. Connect Gmail (OAuth via backend redirect)
 *   2. Pick a time bucket + protected categories
 *   3. Confirm → backend searches Gmail and moves matches to Trash
 */
function App() {
  // Categories the user can *protect* (toggled ON = excluded from sweep).
  // Each maps to a Gmail search operator sent to the backend as an allowlisted value.
  const categories: CategoryToggle[] = [
    { label: "Promotions", default_on: true, category: "category:promotions" },
    { label: "Social", default_on: true, category: "category:social" },
    { label: "Updates", default_on: true, category: "category:updates" },
    { label: "Forums", default_on: false, category: "category:forums" },
    { label: "Primary", default_on: true, category: "category:primary" },
    { label: "Important", default_on: false, category: "is:important" },
    { label: "Unread", default_on: false, category: "is:unread" },
    { label: "Purchases", default_on: false, category: "label:purchases" },
    { label: "Finance", default_on: false, category: "label:finance" },
    { label: "Travel", default_on: false, category: "label:travel" },
    { label: "Newsletters", default_on: false, category: "label:newsletters" },
  ];

  const { isAuthenticated, isLoading, login, logout, refreshAuth } = useAuth();

  // --- Cleanup configuration state ---
  const [selectedBucket, setSelectedBucket] = useState<CleanupBucket | null>(
    null,
  );
  const [excludeStarred, setExcludeStarred] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [view, setView] = useState<"home" | "request">("home");
  const [requestStatus, setRequestStatus] = useState<
    RequestAccessStatus | { type: "idle" }
  >({ type: "idle" });
  const [isRequesting, setIsRequesting] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, boolean>
  >(
    categories.reduce(
      (acc, cat) => ({ ...acc, [cat.label]: cat.default_on }),
      {},
    ),
  );

  const cleanupBuckets: CleanupBucket[] = [
    // IDs must match CLEANUP_BUCKET_IDS on the backend.
    {
      id: "older_than_1y",
      label: "Deep Clean",
      description: "Emails older than 1 year",
      query: "older_than:1y",
      maxResults: 500,
      visual_style: "danger-red",
      estimated_count: "500",
      size_reclaimed: "35 MB",
    },
    {
      id: "older_than_6m",
      label: "Seasonal Sweep",
      description: "Emails older than 6 months",
      query: "older_than:6m",
      maxResults: 200,
      visual_style: "warning-orange",
      estimated_count: "200",
      size_reclaimed: "18 MB",
    },
  ];

  const statusMessages = [
    "Scanning Gmail...",
    "Filtering starred items...",
    "Sweeping...",
  ];

  // After OAuth, Google redirects to the backend which then redirects here
  // with ?auth=success or ?error=... — read those once and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authResult = params.get("auth");
    const error = params.get("error");

    if (authResult === "success") {
      setBanner({
        type: "success",
        message: "Gmail connected. Choose a cleanup option to get started.",
      });
      void refreshAuth();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      setBanner({
        type: "error",
        message:
          error === "no_code"
            ? "Google sign-in was cancelled or failed. Please try again."
            : "Sign-in failed. Please try again.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refreshAuth]);

  const handleBucketSelect = (bucket: CleanupBucket) => {
    setSelectedBucket(bucket);
  };

  const handleCategoryToggle = (label: string, isEnabled: boolean) => {
    setSelectedCategories((prev) => ({ ...prev, [label]: isEnabled }));
  };

  const handleRequestAccess = async (email: string) => {
    setRequestStatus({ type: "idle" });
    setIsRequesting(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/request`, { email });
      setRequestStatus({
        type: "success",
        message:
          "Thanks! If there is a spot available, you will receive an email.",
      });
    } catch {
      setRequestStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSweep = async () => {
    if (!selectedBucket) {
      return null;
    }

    // Send structured choices — the backend builds the Gmail query server-side.
    const excludedCategories = categories
      .filter((cat) => selectedCategories[cat.label])
      .map((cat) => cat.category);

    const response = await apiFetch("/auth/cleanup", {
      method: "POST",
      body: JSON.stringify({
        bucketId: selectedBucket.id,
        excludedCategories,
        excludeStarred,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Cleanup request failed");
    }

    return data as {
      count: number;
      megabytesSaved: number;
      message?: string;
    };
  };

  const handleConfirmSweep = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      // Run the sweep and keep the progress indicator visible for at least 1.5s
      // so the UI doesn't flash too quickly on fast API responses.
      const [result] = await Promise.all([
        handleSweep(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      if (result) {
        setBanner({
          type: "success",
          message:
            result.count > 0
              ? `Moved ${result.count} messages to trash. Reclaimed about ${result.megabytesSaved} MB.`
              : "No messages matched your criteria. Nothing was changed.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during the sweep.";
      setBanner({ type: "error", message });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeframeLabel = () => {
    if (selectedBucket?.id === "older_than_1y") return "past year";
    if (selectedBucket?.id === "older_than_6m") return "past 6 months";
    return "selected period";
  };

  if (view === "request") {
    // Separate view for beta access requests (sends email to admin).
    return (
      <RequestAccess
        isSubmitting={isRequesting}
        status={requestStatus.type === "idle" ? undefined : requestStatus}
        onSubmit={handleRequestAccess}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Email Sweep
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Powered by Google OAuth 2.0
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-gray-500">Checking session...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-green-700 font-medium">
                  Gmail connected
                </span>
                <button
                  onClick={() => void logout()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">Sign in to sweep</span>
                <button
                  onClick={() => setView("request")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Request Access
                </button>
                <button
                  onClick={login}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Connect Gmail
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {banner ? (
          <StatusBanner
            type={banner.type}
            message={banner.message}
            onDismiss={() => setBanner(null)}
          />
        ) : null}

        {!isLoading && !isAuthenticated ? (
          <StatusBanner
            type="info"
            message="Connect your Gmail account to run a cleanup. Your OAuth session is stored securely and expires after 24 hours."
          />
        ) : null}

        <SummaryHeader />

        <CleanupBuckets
          buckets={cleanupBuckets}
          onSelect={handleBucketSelect}
          selectedId={selectedBucket?.id}
        />

        <CategoryToggles
          categories={categories}
          onToggle={handleCategoryToggle}
        />

        <SafetyFeatures
          excludeStarred={excludeStarred}
          onToggleExcludeStarred={setExcludeStarred}
        />

        <div className="flex gap-4 mb-12">
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={!selectedBucket || isProcessing || !isAuthenticated}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isProcessing
              ? "Processing..."
              : !isAuthenticated
                ? "Connect Gmail to Start"
                : "Start Cleanup"}
          </button>
          <button
            onClick={() => setSelectedBucket(null)}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect Gmail, pick a cleanup window, choose categories to
                protect, then confirm. Matching messages are moved to Trash
                (recoverable for 30 days in Gmail).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Privacy & Security
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Email Sweep uses Google OAuth 2.0. We only access Gmail to run
                your chosen cleanup. OAuth tokens are stored in an encrypted
                session and are not written to your inbox.
              </p>
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={showConfirmation}
        count={selectedBucket?.estimated_count || "0"}
        timeframe={getTimeframeLabel()}
        onConfirm={handleConfirmSweep}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isProcessing}
      />

      <ProgressIndicator
        isActive={isProcessing}
        statusMessages={statusMessages}
      />
    </div>
  );
}

export default App;
