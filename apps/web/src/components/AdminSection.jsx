"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit3,
  Users,
  Calendar,
  Shield,
  Target,
} from "lucide-react";

export default function AdminSection() {
  const [activeAdminTab, setActiveAdminTab] = useState("users");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const adminTabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "tournaments", label: "Tournaments", icon: Calendar },
    { id: "points", label: "Points Management", icon: Target },
  ];

  // Queries
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

  const { data: totos = [] } = useQuery({
    queryKey: ["totos"],
    queryFn: async () => {
      const response = await fetch("/api/totos");
      if (!response.ok) throw new Error("Failed to fetch totos");
      return response.json();
    },
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingItem(null);
      setFormData({});
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowAddForm(false);
      setFormData({});
    },
  });

  const addTournamentMutation = useMutation({
    mutationFn: async (tournamentData) => {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) throw new Error("Failed to add tournament");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setShowAddForm(false);
      setFormData({});
    },
  });

  const updateTotoPointsMutation = useMutation({
    mutationFn: async ({ id, points }) => {
      const response = await fetch(`/api/totos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: parseInt(points) }),
      });
      if (!response.ok) throw new Error("Failed to update points");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totos"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setEditingItem(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeAdminTab === "users") {
      if (editingItem) {
        updateUserMutation.mutate({ id: editingItem.id, ...formData });
      } else {
        addUserMutation.mutate(formData);
      }
    } else if (activeAdminTab === "tournaments") {
      addTournamentMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(false);
  };

  const handlePointsUpdate = (toto, newPoints) => {
    updateTotoPointsMutation.mutate({ id: toto.id, points: newPoints });
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowAddForm(false);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-red-500" />
        <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveAdminTab(tab.id);
                  resetForm();
                }}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeAdminTab === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Users Management */}
      {activeAdminTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              User Management
            </h3>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingItem(null);
                setFormData({});
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>

          {/* Add/Edit User Form */}
          {(showAddForm || editingItem) && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingItem ? "Edit User" : "Add New User"}
              </h4>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin
                  </label>
                  <select
                    value={formData.is_admin || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_admin: e.target.value === "true",
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={false}>Regular User</option>
                    <option value={true}>Admin</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex space-x-3">
                  <button
                    type="submit"
                    disabled={
                      addUserMutation.isLoading || updateUserMutation.isLoading
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {editingItem ? "Update User" : "Add User"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {(addUserMutation.error || updateUserMutation.error) && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {addUserMutation.error?.message ||
                    updateUserMutation.error?.message}
                </div>
              )}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_admin
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tournaments Management */}
      {activeAdminTab === "tournaments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Tournament Management
            </h3>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormData({});
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tournament</span>
            </button>
          </div>

          {/* Add Tournament Form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Tournament
              </h4>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.tournament_type || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tournament_type: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="md:col-span-2 flex space-x-3">
                  <button
                    type="submit"
                    disabled={addTournamentMutation.isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Add Tournament
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
            </div>
          )}

          {/* Tournaments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {tournament.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {tournament.tournament_type}
                </p>
                {tournament.start_date && (
                  <p className="text-xs text-gray-500">
                    {new Date(tournament.start_date).toLocaleDateString()} -{" "}
                    {tournament.end_date
                      ? new Date(tournament.end_date).toLocaleDateString()
                      : "TBD"}
                  </p>
                )}
                <div className="mt-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tournament.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tournament.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Management */}
      {activeAdminTab === "points" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Points Management
          </h3>

          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {totos.map((toto) => (
                  <tr key={toto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {toto.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {toto.tournament_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {toto.tournament_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {toto.team_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem?.id === toto.id ? (
                        <input
                          type="number"
                          defaultValue={toto.points}
                          onBlur={(e) =>
                            handlePointsUpdate(toto, e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handlePointsUpdate(toto, e.target.value);
                            }
                          }}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {toto.points}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          setEditingItem(
                            editingItem?.id === toto.id ? null : toto,
                          )
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
