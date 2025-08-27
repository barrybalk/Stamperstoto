"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, User, Flag, RefreshCw } from "lucide-react";

export default function CyclistsSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const {
    data: cyclists = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cyclists"],
    queryFn: async () => {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch cyclists");
      return response.json();
    },
  });

  const addCyclistMutation = useMutation({
    mutationFn: async (cyclistData) => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cyclistData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add cyclist");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cyclists"] });
      setShowAddForm(false);
      setFormData({});
    },
  });

  const deleteCyclistMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete cyclist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cyclists"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCyclistMutation.mutate({
      name: formData.name,
      country: formData.country,
    });
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete cyclist "${name}"?`)) {
      deleteCyclistMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading cyclists...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Cyclists Database</h2>
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
            <span>Add Cyclist</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          About Cyclists
        </h3>
        <p className="text-blue-700">
          These are individual cyclists that users can select when building
          their teams. Each user team must contain exactly 15 cyclists for
          tournament predictions. The database now includes top riders from
          ProCyclingStats.
        </p>
      </div>

      {/* Add Cyclist Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Cyclist
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cyclist Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tadej Pogačar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Slovenia"
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                disabled={addCyclistMutation.isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {addCyclistMutation.isLoading ? "Adding..." : "Add Cyclist"}
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

          {addCyclistMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {addCyclistMutation.error.message}
            </div>
          )}
        </div>
      )}

      {/* Cyclists List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Cyclists ({cyclists.length})
          </h3>
        </div>

        {cyclists.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No cyclists found. Add your first cyclist above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cyclist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cyclists.map((cyclist) => (
                  <tr key={cyclist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {cyclist.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {cyclist.country && (
                          <>
                            <Flag className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {cyclist.country}
                            </span>
                          </>
                        )}
                        {!cyclist.country && (
                          <span className="text-sm text-gray-400">
                            Not specified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cyclist.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(cyclist.id, cyclist.name)}
                        disabled={deleteCyclistMutation.isLoading}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1 disabled:opacity-50"
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
