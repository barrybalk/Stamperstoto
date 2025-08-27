"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Medal, Award, Plus, Target, Zap } from "lucide-react";

export default function ResultsSection() {
  const [selectedTournament, setSelectedTournament] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  // Queries
  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments");
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      return response.json();
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      return response.json();
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results", selectedTournament],
    queryFn: async () => {
      const url = selectedTournament
        ? `/api/results?tournament_id=${selectedTournament}`
        : "/api/results";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
  });

  // Mutations
  const addResultMutation = useMutation({
    mutationFn: async (resultData) => {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add result");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["totos"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setShowAddForm(false);
      setFormData({});
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addResultMutation.mutate({
      tournament_id: parseInt(formData.tournament_id),
      team_id: parseInt(formData.team_id),
      position: parseInt(formData.position),
    });
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{position}</span>;
    }
  };

  const getPositionColor = (position) => {
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

  const calculatePoints = (position) => {
    return Math.max(0, 16 - position);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Tournament Results</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Result</span>
        </button>
      </div>

      {/* Points System Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Points System</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Regular Points</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>🥇 1st place:</span>
                <span className="font-bold">15 points</span>
              </div>
              <div className="flex justify-between">
                <span>🥈 2nd place:</span>
                <span className="font-bold">14 points</span>
              </div>
              <div className="flex justify-between">
                <span>🥉 3rd place:</span>
                <span className="font-bold">13 points</span>
              </div>
              <div className="flex justify-between">
                <span>4th place:</span>
                <span className="font-bold">12 points</span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Points = 16 - position (minimum 0)
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Joker System</span>
            </h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>• Each team can use 1 joker per tournament</div>
              <div>• Joker = <strong>double points</strong> for that prediction</div>
              <div>• Example: 1st place with joker = 30 points</div>
              <div>• Only one joker allowed per team per tournament</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Tournament:</label>
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

      {/* Add Result Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tournament Result</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament *
              </label>
              <select
                value={formData.tournament_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tournament_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Tournament</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team *
              </label>
              <select
                value={formData.team_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, team_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                type="number"
                min="1"
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              {formData.position && (
                <div className="text-xs text-gray-500 mt-1">
                  Points: {calculatePoints(parseInt(formData.position))} (regular) / {calculatePoints(parseInt(formData.position)) * 2} (joker)
                </div>
              )}
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                disabled={addResultMutation.isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Add Result
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>

          {addResultMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {addResultMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Tournament Results
            {selectedTournament &&
              tournaments.find((t) => t.id == selectedTournament) &&
              ` - ${tournaments.find((t) => t.id == selectedTournament).name}`}
          </h3>
        </div>

        {results.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No results available yet. Add tournament results to calculate points automatically!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points Awarded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joker Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPositionColor(result.position)}`}
                      >
                        {getPositionIcon(result.position)}
                        <span className="ml-2">#{result.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.team_name}
                      </div>
                      <div className="text-sm text-gray-500">{result.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.tournament_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.tournament_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-lg font-bold text-gray-900">
                          {result.points_awarded}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-lg font-bold text-yellow-600">
                          {result.points_awarded * 2}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}