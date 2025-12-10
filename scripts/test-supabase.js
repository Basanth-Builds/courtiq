// Test script to verify Supabase connection
// Run with: node scripts/test-supabase.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check your .env.local file contains:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n💡 The profiles table does not exist.')
        console.log('Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.')
      }
      
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message)
      return false
    }
    
    console.log('✅ Authentication service accessible')
    
    // Test realtime
    const channel = supabase.channel('test')
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connection successful')
        channel.unsubscribe()
      } else if (status === 'CHANNEL_ERROR') {
        console.log('⚠️  Realtime connection failed (this is optional)')
      }
    })
    
    // Wait a moment for realtime test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('\n🎉 Supabase setup verification complete!')
    console.log('\nNext steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Visit: http://localhost:3000')
    console.log('3. Test authentication flows')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

testConnection().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})