// src/components/dashboards/ManagerCharts.jsx
import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Define colors for the Pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF00FF'];

export default function ManagerCharts({ employees }) {
  // Memoize chart data to prevent recalculation on every render
  const departmentData = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    const counts = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const performanceData = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    const ratings = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0, 'N/A': 0 };
    employees.forEach(emp => {
      const p = emp.performance;
      if (!p) ratings['N/A']++;
      else if (p <= 2) ratings['1-2']++;
      else if (p <= 3) ratings['2-3']++;
      else if (p <= 4) ratings['3-4']++;
      else if (p <= 5) ratings['4-5']++;
    });
    return Object.entries(ratings).map(([name, value]) => ({ name, value }));
  }, [employees]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Department Distribution Chart */}
      <div className="rounded-xl bg-white p-6 shadow-lg xl:col-span-3">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Department Distribution</h2>
        {departmentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip wrapperClassName="rounded-lg shadow-lg" />
              <Legend />
              <Bar dataKey="value" name="Employees" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No department data to display</p>
        )}
      </div>

      {/* Performance Rating Chart */}
      <div className="rounded-xl bg-white p-6 shadow-lg xl:col-span-2">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Performance Ratings</h2>
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip wrapperClassName="rounded-lg shadow-lg" />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No performance data to display</p>
        )}
      </div>
    </div>
  );
}