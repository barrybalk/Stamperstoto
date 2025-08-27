"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Users,
  Trophy,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  RefreshCw,
  EyeOff,
  Lock,
} from "lucide-react";

export default function UserTeamsSection() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedCyclists, setSelectedCyclists] = useState([]);
  const [viewTeamId, setViewTeamId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(1); // Mock current user - in real app this would come from auth
  const queryClient = useQueryClient();

  // Queries
  const { data: tournaments = [], refetch: refetchTournaments } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments");
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      return response.json();
    },
  });

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: cyclists = [], refetch: refetchCyclists } = useQuery({
    queryKey: ["cyclists"],
    queryFn: async () => {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch cyclists");
      return response.json();
    },
  });

  const { data: userTeams = [], refetch: refetchUserTeams } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      const response = await fetch("/api/user-teams");
      if (!response.ok) throw new Error("Failed to fetch user teams");
      return response.json();
    },
  });

  const { data: teamDetails } = useQuery({
    queryKey: ["user-team-details", viewTeamId],
    queryFn: async () => {
      if (!viewTeamId) return null;
      const response = await fetch(`/api/user-teams/${viewTeamId}`);
      if (!response.ok) throw new Error("Failed to fetch team details");
      return response.json();
    },
    enabled: !!viewTeamId,
  });

  // Mutations
  const createTeamMutation = useMutation({
    mutationFn: async (teamData) => {
      const response = await fetch("/api/user-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      setShowCreateForm(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setSelectedTournament("");
    setSelectedUser("");
    setTeamName("");
    setSelectedCyclists([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCyclists.length !== 15) {
      alert("Please select exactly 15 cyclists for your team.");
      return;
    }

    createTeamMutation.mutate({
      user_id: parseInt(selectedUser),
      tournament_id: parseInt(selectedTournament),
      team_name: teamName,
      cyclists: selectedCyclists,
    });
  };

  const handleCyclistToggle = (cyclistId) => {
    setSelectedCyclists((prev) => {
      if (prev.includes(cyclistId)) {
        return prev.filter((id) => id !== cyclistId);
      } else if (prev.length < 15) {
        return [...prev, cyclistId];
      } else {
        alert("You can only select 15 cyclists per team.");
        return prev;
      }
    });
  };

  const handleRefreshAll = () => {
    refetchTournaments();
    refetchUsers();
    refetchCyclists();
    refetchUserTeams();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "not_started":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "paused":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <Trophy className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const canEditTeam = (status) => {
    return status === "not_started" || status === "paused";
  };

  const canViewTeamDetails = (team) => {
    // Only team owner can see cyclist details, others see only name and points
    return team.user_id === currentUserId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">User Teams</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshAll}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How Teams Work
        </h3>
        <div className="text-blue-700 space-y-2">
          <p>• Each user creates a custom team with their own team name</p>
          <p>
            • Teams must contain exactly <strong>15 cyclists</strong>
          </p>
          <p>
            • Teams can only be created/modified when tournaments are{" "}
            <strong>not started</strong>
          </p>
          <p>• Once a tournament starts, teams are locked</p>
          <p>
            • Points are awarded based on how well the cyclists in your team
            perform
          </p>
          <p>
            • <strong>Privacy:</strong> Only team owners can see their cyclist
            selections
          </p>
        </div>
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Team
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User *
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament *
                </label>
                <select
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Tournament</option>
                  {tournaments
                    .filter((t) => canEditTeam(t.status))
                    .map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name} (
                        {tournament.status?.replace("_", " ")})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lightning Riders"
                  required
                />
              </div>
            </div>

            {/* Cyclist Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Cyclists ({selectedCyclists.length}/15) *
                </label>
                <div className="text-sm text-gray-500">
                  {15 - selectedCyclists.length} more needed
                </div>
              </div>

              <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cyclists.map((cyclist) => (
                    <label
                      key={cyclist.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                        selectedCyclists.includes(cyclist.id)
                          ? "bg-blue-50 border border-blue-200"
                          : "border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCyclists.includes(cyclist.id)}
                        onChange={() => handleCyclistToggle(cyclist.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {cyclist.name}
                        </div>
                        {cyclist.country && (
                          <div className="text-xs text-gray-500">
                            {cyclist.country}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={
                  createTeamMutation.isLoading || selectedCyclists.length !== 15
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {createTeamMutation.isLoading ? "Creating..." : "Create Team"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>

          {createTeamMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {createTeamMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Teams List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All User Teams ({userTeams.length})
          </h3>
        </div>

        {userTeams.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No teams found. Create your first team above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cyclists
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
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
                {userTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.team_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created{" "}
                            {new Date(team.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {team.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.tournament_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            team.cyclist_count == 15
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {team.cyclist_count}/15
                        </span>
                        {team.cyclist_count == 15 && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {team.total_points || 0} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(team.tournament_status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {team.tournament_status?.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canViewTeamDetails(team) ? (
                          <button
                            onClick={() => setViewTeamId(team.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <Lock className="h-4 w-4" />
                            <span className="text-xs">Private</span>
                          </div>
                        )}
                        {canEditTeam(team.tournament_status) &&
                          canViewTeamDetails(team) && (
                            <button className="text-green-600 hover:text-green-900 flex items-center space-x-1">
                              <Edit3 className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Details Modal - Only for team owner */}
      {viewTeamId && teamDetails && canViewTeamDetails(teamDetails) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {teamDetails.team_name}
                </h3>
                <button
                  onClick={() => setViewTeamId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {teamDetails.user_name} • {teamDetails.tournament_name}
              </div>
            </div>
            <div className="px-6 py-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Cyclists ({teamDetails.cyclists?.length || 0}/15)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teamDetails.cyclists?.map((cyclist, index) => (
                  <div
                    key={cyclist.id}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {cyclist.name}
                      </div>
                      {cyclist.country && (
                        <div className="text-xs text-gray-500">
                          {cyclist.country}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
