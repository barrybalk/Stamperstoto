"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Trophy, Zap } from "lucide-react";

export default function TotosSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isJoker, setIsJoker] = useState(false);
  const queryClient = useQueryClient();

  const { data: totos = [], isLoading: totosLoading } = useQuery({
    queryKey: ["totos"],
    queryFn: async () => {
      const response = await fetch("/api/totos");
      if (!response.ok) throw new Error("Failed to fetch totos");
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
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

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      return response.json();
    },
  });

  const addTotoMutation = useMutation({
    mutationFn: async (totoData) => {
      const response = await fetch("/api/totos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(totoData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add toto");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totos"] });
      setShowAddForm(false);
      setSelectedUser("");
      setSelectedTournament("");
      setSelectedTeam("");
      setIsJoker(false);
    },
  });

  const deleteTotoMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/totos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete toto");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totos"] });
    },
  });

  const handleAddToto = (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedTournament || !selectedTeam) return;

    addTotoMutation.mutate({
      user_id: parseInt(selectedUser),
      tournament_id: parseInt(selectedTournament),
      team_id: parseInt(selectedTeam),
      is_joker: isJoker,
    });
  };

  const handleDeleteToto = (id) => {
    if (confirm("Are you sure you want to delete this prediction?")) {
      deleteTotoMutation.mutate(id);
    }
  };

  // Check if selected team already has a joker for selected tournament
  const teamHasJoker = () => {
    if (!selectedTeam || !selectedTournament) return false;
    return totos.some(
      (toto) =>
        toto.team_id == selectedTeam &&
        toto.tournament_id == selectedTournament &&
        toto.is_joker,
    );
  };

  if (totosLoading) {
    return <div className="text-center py-8">Loading predictions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Predictions (Totos)
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Prediction</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Prediction
          </h3>
          <form
            onSubmit={handleAddToto}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
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
                Tournament
              </label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Tournament</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.tournament_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Joker Option */}
            <div className="md:col-span-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="joker"
                  checked={isJoker}
                  onChange={(e) => setIsJoker(e.target.checked)}
                  disabled={teamHasJoker()}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="joker" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Use Joker (Double Points)
                  </span>
                </label>
                {teamHasJoker() && (
                  <span className="text-xs text-red-500">
                    This team already has a joker for this tournament
                  </span>
                )}
              </div>
              {isJoker && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      <strong>Joker Active:</strong> This prediction will earn
                      double points!
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 flex space-x-3">
              <button
                type="submit"
                disabled={addTotoMutation.isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {addTotoMutation.isLoading ? "Adding..." : "Add Prediction"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setIsJoker(false);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>

          {addTotoMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {addTotoMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Totos List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Predictions
          </h3>
        </div>

        {totos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No predictions found. Add your first prediction above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {totos.map((toto) => (
                  <tr
                    key={toto.id}
                    className={`hover:bg-gray-50 ${toto.is_joker ? "bg-yellow-50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {toto.user_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {toto.tournament_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {toto.tournament_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {toto.team_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {toto.is_joker ? (
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">
                            Joker
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Regular</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                        <span
                          className={`text-sm font-medium ${toto.is_joker ? "text-yellow-700" : "text-gray-900"}`}
                        >
                          {toto.points}
                        </span>
                        {toto.is_joker && (
                          <span className="ml-1 text-xs text-yellow-600">
                            (2x)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(toto.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteToto(toto.id)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
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
