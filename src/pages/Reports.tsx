import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31',
  });

  // Mock data - replace with real data
  const monthlyData = [
    { month: 'Jan', emprestado: 4000, recebido: 2400, lucro: 800 },
    { month: 'Fev', emprestado: 3000, recebido: 1398, lucro: 600 },
    { month: 'Mar', emprestado: 2000, recebido: 9800, lucro: 1200 },
    { month: 'Abr', emprestado: 2780, recebido: 3908, lucro: 900 },
    { month: 'Mai', emprestado: 1890, recebido: 4800, lucro: 1100 },
    { month: 'Jun', emprestado: 2390, recebido: 3800, lucro: 950 },
  ];

  const clientData = [
    { name: 'João Silva', emprestimos: 3, valor: 4500, status: 'Ativo' },
    { name: 'Maria Santos', emprestimos: 2, valor: 2800, status: 'Pago' },
    { name: 'Pedro Costa', emprestimos: 1, valor: 1200, status: 'Atrasado' },
    { name: 'Ana Oliveira', emprestimos: 4, valor: 6200, status: 'Ativo' },
  ];

  const statusData = [
    { name: 'Ativos', value: 8, color: '#3B82F6' },
    { name: 'Pagos', value: 12, color: '#10B981' },
    { name: 'Atrasados', value: 3, color: '#EF4444' },
  ];

  const totalStats = {
    totalLoaned: 45600,
    totalReceived: 32400,
    netProfit: 13200,
    activeClients: 15,
  };

  const exportToPDF = () => {
    alert('Funcionalidade de exportação para PDF será implementada');
  };

  const exportToExcel = () => {
    alert('Funcionalidade de exportação para Excel será implementada');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-gray-400">Análise financeira e estatísticas</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={20} />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={20} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Período de Análise</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Inicial
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Final
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Emprestado</p>
              <p className="text-2xl font-bold text-white mt-1">
                R$ {totalStats.totalLoaned.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Recebido</p>
              <p className="text-2xl font-bold text-white mt-1">
                R$ {totalStats.totalReceived.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Lucro Líquido</p>
              <p className="text-2xl font-bold text-white mt-1">
                R$ {totalStats.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Clientes Ativos</p>
              <p className="text-2xl font-bold text-white mt-1">{totalStats.activeClients}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-600">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Mensal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="emprestado" fill="#3B82F6" name="Emprestado" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recebido" fill="#10B981" name="Recebido" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" fill="#8B5CF6" name="Lucro" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Distribuição por Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Relatório por Cliente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Empréstimos</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Valor Total</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white">{client.name}</td>
                  <td className="py-3 px-4 text-gray-300">{client.emprestimos}</td>
                  <td className="py-3 px-4 text-gray-300">R$ {client.valor.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.status === 'Ativo' ? 'bg-blue-400/20 text-blue-400' :
                      client.status === 'Pago' ? 'bg-green-400/20 text-green-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;