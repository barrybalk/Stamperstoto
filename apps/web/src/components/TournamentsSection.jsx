"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Square,
  Calendar,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function TournamentsSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const {
    data: tournaments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments");
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      return response.json();
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData) => {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tournament");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setShowAddForm(false);
      setFormData({});
    },
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/tournaments?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tournament");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/tournaments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update tournament status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTournamentMutation.mutate({
      name: formData.name,
      tournament_type: formData.tournament_type,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    });
  };

  const handleDelete = (id, name) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will remove all related data.`,
      )
    ) {
      deleteTournamentMutation.mutate(id);
    }
  };

  const handleStatusChange = (id, status) => {
    const statusMessages = {
      active: "start this tournament",
      paused: "pause this tournament",
      completed: "complete this tournament",
      not_started: "reset this tournament to not started",
    };

    if (confirm(`Are you sure you want to ${statusMessages[status]}?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "not_started":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "active":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case "not_started":
        return [
          { action: "active", label: "Start", icon: Play, color: "green" },
        ];
      case "active":
        return [
          { action: "paused", label: "Pause", icon: Pause, color: "yellow" },
          {
            action: "completed",
            label: "Complete",
            icon: CheckCircle,
            color: "blue",
          },
        ];
      case "paused":
        return [
          { action: "active", label: "Resume", icon: Play, color: "green" },
          {
            action: "completed",
            label: "Complete",
            icon: CheckCircle,
            color: "blue",
          },
        ];
      case "completed":
        return [
          { action: "not_started", label: "Reset", icon: Clock, color: "gray" },
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tournaments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Tournament Management
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* Tournament Status Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Tournament Status Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              <strong>Not Started:</strong> Teams can be created/modified
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Play className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">
              <strong>Active:</strong> Tournament is running, teams locked
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Pause className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-700">
              <strong>Paused:</strong> Temporarily stopped
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">
              <strong>Completed:</strong> Tournament finished
            </span>
          </div>
        </div>
      </div>

      {/* Add Tournament Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Tournament
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tour de France 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Type *
              </label>
              <select
                value={formData.tournament_type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tournament_type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="Tour de France">Tour de France</option>
                <option value="Vuelta">Vuelta</option>
                <option value="Giro d'Italia">Giro d'Italia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                disabled={createTournamentMutation.isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {createTournamentMutation.isLoading
                  ? "Creating..."
                  : "Create Tournament"}
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

          {createTournamentMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {createTournamentMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Tournaments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Tournaments
          </h3>
        </div>

        {tournaments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tournaments found. Create your first tournament above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-yellow-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tournament.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created{" "}
                            {new Date(
                              tournament.created_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {tournament.tournament_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {tournament.start_date
                            ? new Date(
                                tournament.start_date,
                              ).toLocaleDateString()
                            : "TBD"}
                          {tournament.end_date &&
                            ` - ${new Date(tournament.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tournament.status)}`}
                      >
                        {getStatusIcon(tournament.status)}
                        <span className="ml-2 capitalize">
                          {tournament.status?.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Status Change Buttons */}
                        {getAvailableActions(tournament.status).map(
                          (action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.action}
                                onClick={() =>
                                  handleStatusChange(
                                    tournament.id,
                                    action.action,
                                  )
                                }
                                disabled={updateStatusMutation.isLoading}
                                className={`text-${action.color}-600 hover:text-${action.color}-900 flex items-center space-x-1 px-2 py-1 rounded border border-${action.color}-200 hover:bg-${action.color}-50 disabled:opacity-50`}
                                title={action.label}
                              >
                                <Icon className="h-3 w-3" />
                                <span className="text-xs">{action.label}</span>
                              </button>
                            );
                          },
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDelete(tournament.id, tournament.name)
                          }
                          disabled={deleteTournamentMutation.isLoading}
                          className="text-red-600 hover:text-red-900 flex items-center space-x-1 px-2 py-1 rounded border border-red-200 hover:bg-red-50 disabled:opacity-50"
                          title="Delete Tournament"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading/Error States */}
      {updateStatusMutation.error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {updateStatusMutation.error.message}
        </div>
      )}
    </div>
  );
}
