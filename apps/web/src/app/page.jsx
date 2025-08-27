"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  BarChart3,
  Settings,
  User,
  UserCheck,
  Medal,
} from "lucide-react";
import TotosSection from "../components/TotosSection";
import TeamsSection from "../components/TeamsSection";
import UserTeamsSection from "../components/UserTeamsSection";
import LeaderboardSection from "../components/LeaderboardSection";
import AdminSection from "../components/AdminSection";
import TournamentsSection from "../components/TournamentsSection";
import ResultsSection from "../components/ResultsSection";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/reports/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/reports/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "user-teams", label: "User Teams", icon: UserCheck },
    { id: "tournaments", label: "Tournaments", icon: Calendar },
    { id: "cyclists", label: "Cyclists", icon: User },
    { id: "results", label: "Results", icon: Medal },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "admin", label: "Admin", icon: Settings },
  ];

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
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.overview.total_users}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Cyclists
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.overview.total_teams}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Tournaments
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.overview.total_tournaments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Predictions
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.overview.total_predictions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Teams */}
            {stats && stats.popular_teams && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Most Popular Cyclists
                </h3>
                <div className="space-y-3">
                  {stats.popular_teams.map((team, index) => (
                    <div
                      key={team.team_name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {team.team_name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {team.prediction_count} selections
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Users */}
            {leaderboard && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-sm font-medium ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                                ? "text-gray-400"
                                : index === 2
                                  ? "text-orange-600"
                                  : "text-gray-500"
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.total_points || 0} points
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Teams Tab */}
        {activeTab === "user-teams" && <UserTeamsSection />}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && <TournamentsSection />}

        {/* Cyclists Tab */}
        {activeTab === "cyclists" && <TeamsSection />}

        {/* Results Tab */}
        {activeTab === "results" && <ResultsSection />}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && <LeaderboardSection />}

        {/* Admin Tab */}
        {activeTab === "admin" && <AdminSection />}
      </div>
    </div>
  );
}
