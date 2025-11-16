// src/pages/EmployeeList.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_EMPLOYEES, DEPARTMENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaFilter
} from 'react-icons/fa';
import { IoIosSearch } from 'react-icons/io';

export default function EmployeeListPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [employees, setEmployees] = useLocalStorage('employees', MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState({ field: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isManager = user.role === 'manager';

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const updatedEmployees = employees.filter((emp) => emp.id !== id);
      setEmployees(updatedEmployees);
      success(`${name} has been deleted successfully`);
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch = 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField.field];
      let bVal = b[sortField.field];
      
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortField.direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [employees, searchTerm, selectedDepartment, selectedStatus, sortField]);

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage]);

  const handleSort = (field) => {
    setSortField(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }) => {
    if (sortField.field !== field) {
      return <FaSort className="ml-1 inline text-gray-400" size={12} />;
    }
    return sortField.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline text-blue-600" size={12} />
      : <FaSortDown className="ml-1 inline text-blue-600" size={12} />;
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Position', 'Department', 'Email', 'Phone', 'Salary', 'Status', 'Hire Date'].join(','),
      ...filteredAndSortedEmployees.map(emp => [
        emp.name,
        emp.position,
        emp.department || '',
        emp.email,
        emp.phone || '',
        emp.salary || '',
        emp.status || '',
        emp.hireDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    success('Employee data exported successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
        <div className="flex flex-wrap gap-3">
          {isManager && (
            <>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <FaFileExport size={14} />
                Export CSV
              </button>
              <Link
                to="/employees/add"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <FaPlus size={14} />
                Add Employee
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              className="block w-full rounded-lg border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IoIosSearch className="text-gray-400" size={20} />
            </div>
          </div>
          
          <select
            className="block w-full rounded-lg border-gray-300 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="block w-full rounded-lg border-gray-300 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th 
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </th>
              <th 
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
                onClick={() => handleSort('position')}
              >
                Position <SortIcon field="position" />
              </th>
              <th 
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
                onClick={() => handleSort('department')}
              >
                Department <SortIcon field="department" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Phone</th>
              <th 
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
                onClick={() => handleSort('salary')}
              >
                Salary <SortIcon field="salary" />
              </th>
              <th 
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedEmployees.map((emp) => (
              <tr key={emp.id} className="transition-colors hover:bg-blue-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span className="font-semibold">{emp.name?.charAt(0) || '?'}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      {emp.employeeId && (
                        <div className="text-xs text-gray-500">{emp.employeeId}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {emp.department || 'N/A'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{emp.phone || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {emp.salary ? `$${emp.salary.toLocaleString()}` : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    emp.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : emp.status === 'on-leave'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {emp.status || 'active'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/employees/view/${emp.id}`}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                      title="View"
                    >
                      <FaEye size={16} />
                    </Link>
                    {isManager && (
                      <>
                        <Link
                          to={`/employees/${emp.id}`}
                          className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-100"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedEmployees.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center shadow-lg">
          <p className="text-lg font-medium text-gray-900">No employees found</p>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSortedEmployees.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}