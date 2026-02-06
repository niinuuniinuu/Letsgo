-- Seed Data for SNBT Tryout

-- 1. Insert Tryout (Fixed ID for easier reference)
INSERT INTO public.tryouts (id, title, description, price, is_free, status, duration_minutes, scoring_type)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tryout SNBT 2026 - Prediksi 1', 'Latihan soal lengkap dengan sistem penilaian IRT terbaru. Mencakup Penalaran Umum, Pengetahuan Kuantitatif, dan Literasi.', 0, true, 'active', 105, 'irt')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Questions for the Tryout
INSERT INTO public.questions (tryout_id, content, options, correct_answer, irt_weight, category, order_index)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '{"text": "Jika semua siswa rajin belajar, maka mereka akan lulus ujian. Budi tidak lulus ujian.", "question": "Kesimpulan yang sah adalah..."}',
        '[{"label": "A", "text": "Budi rajin belajar"}, {"label": "B", "text": "Budi tidak rajin belajar"}, {"label": "C", "text": "Budi mungkin rajin belajar"}, {"label": "D", "text": "Tidak ada siswa yang lulus"}, {"label": "E", "text": "Ujian sulit"}]',
        'B',
        1.2,
        'Penalaran Umum',
        1
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '{"text": "Diketahui persamaan kuadrat 2x² - 5x + 3 = 0.", "question": "Akar-akar persamaan tersebut adalah..."}',
        '[{"label": "A", "text": "1 dan 2"}, {"label": "B", "text": "1 dan -1.5"}, {"label": "C", "text": "1 dan 1.5"}, {"label": "D", "text": "-1 dan 1.5"}, {"label": "E", "text": "2 dan 3"}]',
        'C',
        1.5,
        'Pengetahuan Kuantitatif',
        2
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '{"text": "Manakah kalimat berikut yang menggunakan tanda baca yang benar?", "question": ""}',
        '[{"label": "A", "text": "Ibu membeli apel, jeruk, dan mangga."}, {"label": "B", "text": "Ibu membeli: apel, jeruk dan mangga."}, {"label": "C", "text": "Ibu membeli apel; jeruk; dan mangga."}, {"label": "D", "text": "Ibu membeli apel, jeruk, dan mangga"}, {"label": "E", "text": "Ibu membeli apel, jeruk dan mangga."}]',
        'A',
        1.0,
        'Literasi Bahasa Indonesia',
        3
    );
