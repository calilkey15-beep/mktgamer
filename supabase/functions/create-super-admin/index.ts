import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Criar super admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@loansaas.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: { 
        role: 'super_admin',
        name: 'Super Administrador'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create super admin user', details: authError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar perfil de super admin
    const { data: profileData, error: profileError } = await supabase
      .from('tenant_users')
      .insert({
        auth_user_id: authData.user.id,
        email: 'admin@loansaas.com',
        name: 'Super Administrador',
        role: 'super_admin'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create super admin profile', details: profileError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar tenant de exemplo para demonstração
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Empresa Demo',
        slug: 'empresa-demo',
        company_name: 'Empresa Demo Ltda',
        company_email: 'contato@empresademo.com',
        subscription_plan: 'trial',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Tenant error:', tenantError)
    }

    // Criar usuário admin do tenant demo
    if (tenantData) {
      const { data: tenantAdminAuth, error: tenantAdminAuthError } = await supabase.auth.admin.createUser({
        email: 'admin@empresademo.com',
        password: 'demo123456',
        email_confirm: true,
        user_metadata: { 
          role: 'tenant_admin',
          name: 'Admin Demo',
          tenant_id: tenantData.id
        }
      })

      if (!tenantAdminAuthError) {
        await supabase
          .from('tenant_users')
          .insert({
            tenant_id: tenantData.id,
            auth_user_id: tenantAdminAuth.user.id,
            email: 'admin@empresademo.com',
            name: 'Admin Demo',
            role: 'tenant_admin'
          })
      }
    }

    // Testar algumas operações básicas
    const tests = []

    // Test 1: Verificar se o super admin foi criado
    const { data: superAdminCheck, error: superAdminError } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('role', 'super_admin')
      .single()

    tests.push({
      name: 'Super Admin Created',
      success: !superAdminError && superAdminCheck,
      error: superAdminError?.message
    })

    // Test 2: Verificar se o tenant foi criado
    tests.push({
      name: 'Demo Tenant Created',
      success: !tenantError && tenantData,
      error: tenantError?.message
    })

    // Test 3: Testar login do super admin
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@loansaas.com',
      password: 'admin123456'
    })

    tests.push({
      name: 'Super Admin Login Test',
      success: !loginError && loginData.user,
      error: loginError?.message
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Super admin e tenant demo criados com sucesso!',
        credentials: {
          super_admin: {
            email: 'admin@loansaas.com',
            password: 'admin123456',
            role: 'super_admin'
          },
          tenant_demo: {
            email: 'admin@empresademo.com',
            password: 'demo123456',
            role: 'tenant_admin',
            tenant: 'empresa-demo'
          }
        },
        super_admin: {
          id: authData.user.id,
          email: authData.user.email,
          profile: profileData
        },
        demo_tenant: tenantData,
        tests: tests,
        summary: {
          total_tests: tests.length,
          passed: tests.filter(t => t.success).length,
          failed: tests.filter(t => !t.success).length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error occurred', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})