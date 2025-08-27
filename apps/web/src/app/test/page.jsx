"use client";

import { useQuery } from "@tanstack/react-query";

export default function TestPage() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Users from API:</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>
    </div>
  );
}