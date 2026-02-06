import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const key = process.env.SUPABASE_KEY || ''
const url = process.env.SUPABASE_URL || ''

console.log('--- ENV AUDIT ---')
console.log(`URL Set: ${!!url}`)
console.log(`KEY Set: ${!!key}`)

if (!key) {
    console.error('❌ SUPABASE_KEY is missing!')
    process.exit(1)
}

try {
    // Basic JWT check (middle part contains claims)
    const parts = key.split('.')
    if (parts.length !== 3) {
        console.log('⚠️  Key format unknown (not a standard JWT?)')
    } else {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        console.log(`🔑 Key Role: "${payload.role}"`)

        if (payload.role === 'service_role') {
            console.error('❌ DANGER: You are using a SERVICE_ROLE key as standard SUPABASE_KEY!')
            console.error('   This key skips all security policies.')
            console.error('   Supabase Client refuses to use this in the browser (Security Feature).')
            console.error('   ACTION: Replace SUPABASE_KEY in .env with your ANON (Public) key.')
        } else if (payload.role === 'anon') {
            console.log('✅ Key Type: ANON (Correct for client use)')
        } else {
            console.log(`?  Key Role: ${payload.role}`)
        }
    }
} catch (e) {
    console.error('Error decoding key:', e.message)
}
console.log('-----------------')
