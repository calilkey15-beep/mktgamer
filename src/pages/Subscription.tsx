import React, { useState } from 'react';
import { Crown, Check, Zap, Star, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSubscriptionPayment, updateUserPlan } from '../lib/supabase';
import { toast } from 'react-toastify';

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro');

  const plans = {
    free: {
      name: 'FREE',
      price: 0,
      period: 'Sempre grátis',
      color: 'from-gray-600 to-gray-700',
      icon: null,
      features: [
        'Até 2 clientes',
        'Até 3 empréstimos',
        'Dashboard básico',
        'Suporte por email',
      ],
      limits: {
        clients: 2,
        loans: 3,
        export: false,
        whatsapp: false,
        contracts: false,
      }
    },
    pro: {
      name: 'PRO',
      price: 25,
      period: 'por mês',
      color: 'from-blue-600 to-blue-700',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Até 50 clientes',
        'Até 100 empréstimos',
        'Relatórios avançados',
        'Exportação de dados',
        'WhatsApp manual',
        'Suporte prioritário',
      ],
      limits: {
        clients: 50,
        loans: 100,
        export: true,
        whatsapp: 'manual',
        contracts: false,
      }
    },
    premium: {
      name: 'PREMIUM',
      price: 50,
      period: 'por mês',
      color: 'from-purple-600 to-purple-700',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Clientes ilimitados',
        'Empréstimos ilimitados',
        'Geração de contratos',
        'WhatsApp automático',
        'API personalizada',
        'Suporte 24/7',
        'Backup automático',
      ],
      limits: {
        clients: Infinity,
        loans: Infinity,
        export: true,
        whatsapp: 'auto',
        contracts: true,
      }
    }
  };

  const handleSubscribe = async (plan: 'pro' | 'premium') => {
    setLoading(true);
    try {
      // Create payment record
      await createSubscriptionPayment(plan, 'PIX');
      
      // Update user plan (in a real app, this would happen after payment confirmation)
      await updateUserPlan(plan);
      
      toast.success(`Plano ${plan.toUpperCase()} ativado com sucesso!`);
      
      // Refresh page to update user context
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const PlanCard: React.FC<{ planKey: keyof typeof plans; plan: any; isCurrentPlan: boolean }> = ({ 
    planKey, 
    plan, 
    isCurrentPlan 
  }) => (
    <div className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-200 ${
      isCurrentPlan 
        ? 'border-green-500 shadow-lg shadow-green-500/20' 
        : planKey === selectedPlan 
          ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
          : 'border-gray-700 hover:border-gray-600'
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Plano Atual
          </span>
        </div>
      )}
      
      {planKey === 'premium' && !isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Mais Popular</span>
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} mb-4`}>
          {plan.icon || <div className="w-6 h-6 bg-white/20 rounded" />}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="text-4xl font-bold text-white mb-1">
          {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
        </div>
        <p className="text-gray-400">{plan.period}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {!isCurrentPlan && planKey !== 'free' && (
        <button
          onClick={() => handleSubscribe(planKey as 'pro' | 'premium')}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            planKey === selectedPlan
              ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transform hover:scale-105`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {loading ? 'Processando...' : `Assinar ${plan.name}`}
        </button>
      )}

      {planKey === 'free' && !isCurrentPlan && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">Plano gratuito disponível no cadastro</p>
        </div>
      )}

      {isCurrentPlan && (
        <div className="text-center">
          <div className="bg-green-500/20 text-green-400 py-2 px-4 rounded-xl">
            ✓ Plano Ativo
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Escolha seu Plano
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Desbloqueie todo o potencial da plataforma com nossos planos premium
        </p>
      </div>

      {/* Current Plan Info */}
      {user && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Plano Atual</h3>
              <p className="text-gray-400">
                Você está no plano <span className="text-blue-400 font-medium">{user.plan?.toUpperCase()}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${plans[user.plan || 'free'].color}`}>
              <span className="text-white font-medium">{plans[user.plan || 'free'].name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([key, plan]) => (
          <PlanCard
            key={key}
            planKey={key as keyof typeof plans}
            plan={plan}
            isCurrentPlan={user?.plan === key}
          />
        ))}
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          Métodos de Pagamento Aceitos
        </h3>
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2 text-gray-300">
            <Smartphone className="w-6 h-6 text-green-500" />
            <span>PIX</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <span>Cartão de Crédito</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Perguntas Frequentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Posso cancelar a qualquer momento?</h4>
            <p className="text-gray-400 text-sm">
              Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Os dados são mantidos após o cancelamento?</h4>
            <p className="text-gray-400 text-sm">
              Seus dados são mantidos por 30 dias após o cancelamento para possível reativação.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Posso fazer upgrade/downgrade?</h4>
            <p className="text-gray-400 text-sm">
              Sim, você pode alterar seu plano a qualquer momento. Ajustes são feitos proporcionalmente.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Há desconto para pagamento anual?</h4>
            <p className="text-gray-400 text-sm">
              Sim, oferecemos 20% de desconto para assinaturas anuais. Entre em contato conosco.
            </p>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          Precisa de ajuda para escolher o plano ideal?
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
          Falar com Suporte
        </button>
      </div>
    </div>
  );
};

export default Subscription;