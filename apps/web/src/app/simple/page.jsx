"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

export default function SimplePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/reports/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading Cycling Toto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Cycling Toto</h1>
            </div>
            <div className="text-sm text-gray-600">
              Tour de France • Vuelta • Giro d'Italia
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

          {/* Stats Cards */}
          {stats && stats.overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_users}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_teams}
                </div>
                <div className="text-sm text-gray-600">Total Teams</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_tournaments}
                </div>
                <div className="text-sm text-gray-600">Tournaments</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.overview.total_predictions}
                </div>
                <div className="text-sm text-gray-600">Total Predictions</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex">
              <Trophy className="h-5 w-5 mr-2" />
              <div>
                <strong>Success!</strong> Your Cycling Toto app is working! 🚴‍♂️
                <br />
                <span className="text-sm">
                  Go back to the main page (/) to see the full app with all features.
                </span>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Info</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}