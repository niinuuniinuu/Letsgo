
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('🌱 Starting seed process...')

    const bankPath = path.join(__dirname, 'question_bank.json')
    const bankData = JSON.parse(fs.readFileSync(bankPath, 'utf-8'))

    for (const tryoutData of bankData) {
        console.log(`Processing Tryout: ${tryoutData.title}`)

        // 1. Insert Tryout
        const { data: tryout, error: tryoutError } = await supabase
            .from('tryouts')
            .insert({
                title: tryoutData.title,
                description: tryoutData.description,
                duration_minutes: tryoutData.duration_minutes,
                scoring_type: tryoutData.scoring_type,
                is_free: tryoutData.is_free,
                price: tryoutData.price || 0,
                status: 'active'
            })
            .select()
            .single()

        if (tryoutError) {
            console.error('Error creating tryout:', tryoutError.message)
            continue
        }

        console.log(`  ✅ Created Tryout ID: ${tryout.id}`)

        // 2. Insert Questions
        const questionsPayload = tryoutData.questions.map((q: any, index: number) => ({
            tryout_id: tryout.id,
            content: q.content,
            options: q.options,
            correct_answer: q.correct_answer,
            irt_weight: q.irt_weight,
            category: q.category,
            order_index: index + 1
        }))

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsPayload)

        if (questionsError) {
            console.error('  ❌ Error inserting questions:', questionsError.message)
        } else {
            console.log(`  ✅ Inserted ${questionsPayload.length} questions`)
        }
    }

    console.log('✨ Seed process completed!')
}

seed()
