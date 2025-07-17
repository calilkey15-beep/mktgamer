import React, { useState } from 'react';
import { Database, Key, User, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

const SetupSupabase: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const createAdminUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setTestResults(result);
      
      if (result.success) {
        setStep(4);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      setTestResults({ error: 'Falha ao conectar com Supabase' });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase.from('clients').select('count').limit(1);
      
      if (error) {
        setTestResults({ 
          error: 'Erro de conexão com Supabase', 
          details: error.message 
        });
      } else {
        setTestResults({ 
          success: true, 
          message: 'Conexão com Supabase estabelecida!' 
        });
        setStep(3);
      }
    } catch (error) {
      setTestResults({ 
        error: 'Falha na conexão', 
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Configuração do Supabase</h1>
            <p className="text-gray-400">Vamos configurar seu banco de dados real</p>
          </div>

          {/* Step 1: Environment Variables */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Passo 1: Configurar Variáveis de Ambiente
              </h3>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Crie um arquivo .env na raiz do projeto:</h4>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=https://hsbmgklyygbmwgtvghyl.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI`}
                </pre>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">📋 Como obter as chaves:</h4>
                <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Acesse seu projeto no Supabase Dashboard</li>
                  <li>Vá em Settings → API</li>
                  <li>Copie a URL e a anon/public key</li>
                  <li>Cole no arquivo .env</li>
                  <li>Reinicie o servidor (npm run dev)</li>
                </ol>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Próximo: Testar Conexão
              </button>
            </div>
          )}

          {/* Step 2: Test Connection */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Passo 2: Testar Conexão
              </h3>
              
              <div className="text-center">
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-5 h-5" />
                      <span>Testar Conexão com Supabase</span>
                    </>
                  )}
                </button>
              </div>

              {testResults && (
                <div className={`p-4 rounded-lg ${
                  testResults.error ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'
                }`}>
                  {testResults.error ? (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{testResults.error}</p>
                        {testResults.details && (
                          <p className="text-sm text-red-300 mt-1">{testResults.details}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <p className="font-medium">{testResults.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Create Admin User */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Passo 3: Criar Usuário Administrador
              </h3>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Credenciais do Admin:</h4>
                <div className="text-gray-300 space-y-1">
                  <p>📧 Email: admin@sistema.com</p>
                  <p>🔑 Senha: 123456</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={createAdminUser}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Criando usuário...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Criar Usuário Admin</span>
                    </>
                  )}
                </button>
              </div>

              {testResults && (
                <div className="space-y-4">
                  {testResults.error ? (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium">{testResults.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-400 mb-3">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Usuário criado com sucesso!</p>
                      </div>
                      
                      {testResults.tests && (
                        <div className="mt-4">
                          <h5 className="text-white font-medium mb-2">Testes Executados:</h5>
                          <div className="space-y-2">
                            {testResults.tests.map((test: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                {test.success ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-red-400" />
                                )}
                                <span className={test.success ? 'text-green-300' : 'text-red-300'}>
                                  {test.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {testResults.summary && (
                            <div className="mt-3 text-sm text-gray-300">
                              ✅ {testResults.summary.passed} passou | ❌ {testResults.summary.failed} falhou
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  🎉 Configuração Concluída!
                </h3>
                <p className="text-gray-400">
                  Seu Supabase está configurado e funcionando com dados reais
                </p>
              </div>

              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Agora você pode:</h4>
                <ul className="text-gray-300 text-sm space-y-1 text-left">
                  <li>✅ Fazer login com admin@sistema.com / 123456</li>
                  <li>✅ Cadastrar clientes reais no banco</li>
                  <li>✅ Criar empréstimos funcionais</li>
                  <li>✅ Registrar pagamentos</li>
                  <li>✅ Gerar relatórios com dados reais</li>
                </ul>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Ir para o Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupSupabase;