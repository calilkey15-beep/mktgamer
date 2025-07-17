import React, { useState } from 'react';
import { User, Lock, Bell, Database, Shield, MessageSquare, FileText, DollarSign } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    darkMode: true,
    whatsappEnabled: true,
    emailEnabled: true,
    autoContractGeneration: true,
    reminderDaysBeforeDue: 3,
    defaultInterestRate: 30,
    dailyInterestRate: 0.1,
    lateFeePercentage: 2,
  });
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    overdue: true,
    payments: true,
    dueSoon: true,
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'contracts', label: 'Contratos', icon: FileText },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'system', label: 'Sistema', icon: Database },
  ];

  const TabButton: React.FC<{ tab: any; isActive: boolean; onClick: () => void }> = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span>{tab.label}</span>
      </button>
    );
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Informações do Perfil</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            defaultValue="Administrador"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            E-mail
          </label>
          <input
            type="email"
            defaultValue="admin@sistema.com"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cargo
          </label>
          <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="user">Usuário</option>
          </select>
        </div>
      </div>
      
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
        Salvar Alterações
      </button>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações de Segurança</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Senha Atual
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite sua senha atual"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nova Senha
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite a nova senha"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirme a nova senha"
          />
        </div>
      </div>
      
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Requisitos da Senha</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Mínimo de 8 caracteres</li>
          <li>• Pelo menos uma letra maiúscula</li>
          <li>• Pelo menos uma letra minúscula</li>
          <li>• Pelo menos um número</li>
          <li>• Pelo menos um caractere especial</li>
        </ul>
      </div>
      
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
        Alterar Senha
      </button>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações de Notificações</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Notificações por E-mail</h4>
            <p className="text-gray-400 text-sm">Receber alertas por e-mail</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Notificações por WhatsApp</h4>
            <p className="text-gray-400 text-sm">Receber alertas por WhatsApp</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.whatsapp}
              onChange={(e) => setNotifications(prev => ({ ...prev, whatsapp: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Empréstimos Vencendo</h4>
            <p className="text-gray-400 text-sm">Alertas para empréstimos que vencem em breve</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.dueSoon}
              onChange={(e) => setNotifications(prev => ({ ...prev, dueSoon: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Alertas de Vencimento</h4>
            <p className="text-gray-400 text-sm">Notificar sobre empréstimos vencendo</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.overdue}
              onChange={(e) => setNotifications(prev => ({ ...prev, overdue: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Confirmação de Pagamentos</h4>
            <p className="text-gray-400 text-sm">Notificar quando pagamentos forem recebidos</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.payments}
              onChange={(e) => setNotifications(prev => ({ ...prev, payments: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">Dias de Antecedência para Lembretes</h4>
          <p className="text-gray-400 text-sm mb-3">Quantos dias antes do vencimento enviar lembretes</p>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.reminderDaysBeforeDue}
            onChange={(e) => setSettings(prev => ({ ...prev, reminderDaysBeforeDue: parseInt(e.target.value) }))}
            className="w-20 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
          />
          <span className="text-gray-300 ml-2">dias</span>
        </div>
      </div>
    </div>
  );

  const WhatsAppTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações do WhatsApp</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">WhatsApp Habilitado</h4>
            <p className="text-gray-400 text-sm">Ativar integração com WhatsApp</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.whatsappEnabled}
              onChange={(e) => setSettings(prev => ({ ...prev, whatsappEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">API do WhatsApp</h4>
          <p className="text-gray-400 text-sm mb-3">Configure sua API do WhatsApp Business</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">URL da API</label>
              <input
                type="url"
                placeholder="https://api.whatsapp.com/send"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Token de Acesso</label>
              <input
                type="password"
                placeholder="Seu token de acesso"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">💡 Como configurar</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>1. Crie uma conta no WhatsApp Business API</li>
            <li>2. Obtenha seu token de acesso</li>
            <li>3. Configure a URL da API</li>
            <li>4. Teste o envio de mensagens</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ContractsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações de Contratos</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Geração Automática</h4>
            <p className="text-gray-400 text-sm">Gerar contratos automaticamente ao criar empréstimos</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoContractGeneration}
              onChange={(e) => setSettings(prev => ({ ...prev, autoContractGeneration: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">Dados da Empresa</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Empresa</label>
              <input
                type="text"
                defaultValue={import.meta.env.VITE_COMPANY_NAME || ''}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CNPJ</label>
              <input
                type="text"
                defaultValue={import.meta.env.VITE_COMPANY_CNPJ || ''}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
              <textarea
                rows={2}
                defaultValue={import.meta.env.VITE_COMPANY_ADDRESS || ''}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">Termos Padrão do Contrato</h4>
          <textarea
            rows={6}
            defaultValue="1. O cliente se compromete a pagar o valor total do empréstimo na data de vencimento.
2. Em caso de atraso, será cobrada multa de 2% sobre o valor em aberto.
3. Juros de mora de 0,1% ao dia sobre o valor em atraso.
4. O não pagamento na data acordada implicará em protesto e negativação.
5. As partes elegem o foro da comarca local para dirimir questões.
6. Este contrato é válido e tem força de título executivo extrajudicial."
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white resize-none"
          />
        </div>
      </div>
    </div>
  );

  const FinancialTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações Financeiras</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">Taxas Padrão</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taxa de Juros Padrão (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultInterestRate}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultInterestRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Juros de Atraso (% ao dia)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.dailyInterestRate}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyInterestRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Multa de Atraso (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.lateFeePercentage}
                onChange={(e) => setSettings(prev => ({ ...prev, lateFeePercentage: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">📊 Simulação de Cálculo</h4>
          <p className="text-gray-300 text-sm mb-2">
            Empréstimo de R$ 1.000 com {settings.defaultInterestRate}% de juros:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Valor a receber:</p>
              <p className="text-green-400 font-medium">
                R$ {(1000 * (1 + settings.defaultInterestRate / 100)).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Lucro:</p>
              <p className="text-blue-400 font-medium">
                R$ {(1000 * (settings.defaultInterestRate / 100)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Configurações do Sistema</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Modo Escuro</h4>
            <p className="text-gray-400 text-sm">Alternar entre tema claro e escuro</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-2">Backup de Dados</h4>
          <p className="text-gray-400 text-sm mb-4">Faça backup regular dos seus dados</p>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Fazer Backup
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
              Restaurar Backup
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
          <h4 className="text-yellow-400 font-medium mb-2">⚠️ Zona de Perigo</h4>
          <p className="text-gray-300 text-sm mb-3">
            Ações irreversíveis que podem afetar todos os dados do sistema
          </p>
          <div className="flex space-x-2">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Resetar Sistema
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
              Exportar Todos os Dados
            </button>
          </div>
        </div>
      </div>
      
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
        Salvar Configurações
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      case 'whatsapp': return <WhatsAppTab />;
      case 'contracts': return <ContractsTab />;
      case 'financial': return <FinancialTab />;
      case 'system': return <SystemTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;