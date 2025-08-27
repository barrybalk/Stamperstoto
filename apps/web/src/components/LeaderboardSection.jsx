"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function LeaderboardSection() {
  const [selectedTournament, setSelectedTournament] = useState("");

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["leaderboard", selectedTournament],
    queryFn: async () => {
      const url = selectedTournament
        ? `/api/reports/leaderboard?tournament_id=${selectedTournament}`
        : "/api/reports/leaderboard";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments");
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/reports/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  // Prepare chart data
  const chartData = leaderboard.slice(0, 10).map((user) => ({
    name:
      user.name.length > 15 ? user.name.substring(0, 15) + "..." : user.name,
    points: user.total_points || 0,
    predictions: user.total_predictions || 0,
  }));

  const pieData =
    stats?.tournament_types?.map((type, index) => ({
      name: type.tournament_type,
      value: parseInt(type.count),
      color: ["#8884d8", "#82ca9d", "#ffc658"][index % 3],
    })) || [];

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return (
          <span className="text-lg font-bold text-gray-500">#{position}</span>
        );
    }
  };

  const getRankBadge = (position) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>

        {/* Tournament Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tournaments</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Users by Points
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tournament Distribution */}
        {pieData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tournament Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Rankings{" "}
            {selectedTournament &&
              tournaments.find((t) => t.id == selectedTournament) &&
              `- ${tournaments.find((t) => t.id == selectedTournament).name}`}
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No rankings available yet. Users need to make predictions first!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predictions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((user, index) => {
                  const position = index + 1;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 ${position <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRankBadge(position)}`}
                        >
                          {getRankIcon(position)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-lg font-bold text-gray-900">
                            {user.total_points || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.total_predictions || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.avg_points
                          ? parseFloat(user.avg_points).toFixed(1)
                          : "0.0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            🏆 Podium 🏆
          </h3>
          <div className="flex justify-center items-end space-x-4">
            {/* Second Place */}
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-2 h-24 flex items-center justify-center">
                <Medal className="h-12 w-12 text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {leaderboard[1]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {leaderboard[1]?.total_points || 0} pts
              </div>
            </div>

            {/* First Place */}
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg mb-2 h-32 flex items-center justify-center">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {leaderboard[0]?.name}
              </div>
              <div className="text-sm text-gray-500">
                {leaderboard[0]?.total_points || 0} pts
              </div>
            </div>

            {/* Third Place */}
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-lg mb-2 h-20 flex items-center justify-center">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {leaderboard[2]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {leaderboard[2]?.total_points || 0} pts
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
