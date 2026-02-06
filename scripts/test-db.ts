import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

async function test() {
    console.log('Testing Transactions Table...')
    const { error } = await supabase
        .from('transactions')
        .select('count')
        .limit(1)

    if (error) {
        console.error('❌ Table Check Failed:', error.message)
        if (error.code === '42P01') {
            console.error('   -> Table "transactions" does not exist!')
        }
    } else {
        console.log('✅ transactions table exists!')
    }
}

test()
