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

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@sistema.com',
      password: '123456',
      email_confirm: true,
      user_metadata: { 
        role: 'admin',
        name: 'Administrador'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user profile in database
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: 'admin@sistema.com',
        name: 'Administrador',
        role: 'admin'
      })
      .select()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Test database operations
    const tests = []

    // Test 1: Create a test client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: 'Cliente Teste',
        phone: '(11) 99999-9999',
        address: 'Endereço de Teste, 123'
      })
      .select()
      .single()

    tests.push({
      name: 'Create Client',
      success: !clientError,
      error: clientError?.message
    })

    // Test 2: Create a test loan (if client was created)
    let loanData = null
    if (clientData) {
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert({
          client_id: clientData.id,
          type: 'loan',
          amount: 1000,
          interest_rate: 30,
          loan_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          installments: 1,
          total_amount: 1300,
          installment_amount: 1300,
          status: 'active'
        })
        .select()
        .single()

      loanData = loan
      tests.push({
        name: 'Create Loan',
        success: !loanError,
        error: loanError?.message
      })
    }

    // Test 3: Create a payment (if loan was created)
    if (loanData) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          loan_id: loanData.id,
          amount: 500,
          payment_date: new Date().toISOString(),
          installment_number: 1
        })

      tests.push({
        name: 'Create Payment',
        success: !paymentError,
        error: paymentError?.message
      })
    }

    // Test 4: Test authentication
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@sistema.com',
      password: '123456'
    })

    tests.push({
      name: 'Login Test',
      success: !loginError,
      error: loginError?.message
    })

    // Clean up test data
    if (loanData) {
      await supabase.from('loans').delete().eq('id', loanData.id)
    }
    if (clientData) {
      await supabase.from('clients').delete().eq('id', clientData.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          confirmed: authData.user.email_confirmed_at !== null
        },
        profile: profileData,
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