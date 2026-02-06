import type { Question } from '~/core/irt-engine'

export const mockQuestions: (Question & { content: any, options: any[] })[] = [
    {
        id: 'q1',
        weight: 1.2,
        correctAnswer: 'B',
        content: {
            text: "Jika semua siswa rajin belajar, maka mereka akan lulus ujian. Budi tidak lulus ujian.",
            question: "Kesimpulan yang sah adalah..."
        },
        options: [
            { label: "A", text: "Budi rajin belajar" },
            { label: "B", text: "Budi tidak rajin belajar" },
            { label: "C", text: "Budi mungkin rajin belajar" },
            { label: "D", text: "Tidak ada siswa yang lulus" },
            { label: "E", text: "Ujian sulit" }
        ]
    },
    {
        id: 'q2',
        weight: 1.5,
        correctAnswer: 'C',
        content: {
            text: "Diketahui persamaan kuadrat 2x² - 5x + 3 = 0.",
            question: "Akar-akar persamaan tersebut adalah..."
        },
        options: [
            { label: "A", text: "1 dan 2" },
            { label: "B", text: "1 dan -1.5" },
            { label: "C", text: "1 dan 1.5" },
            { label: "D", text: "-1 dan 1.5" },
            { label: "E", text: "2 dan 3" }
        ]
    },
    {
        id: 'q3',
        weight: 1.0,
        correctAnswer: 'A',
        content: {
            text: "Manakah kalimat berikut yang menggunakan tanda baca yang benar?",
            question: ""
        },
        options: [
            { label: "A", text: "Ibu membeli apel, jeruk, dan mangga." },
            { label: "B", text: "Ibu membeli: apel, jeruk dan mangga." },
            { label: "C", text: "Ibu membeli apel; jeruk; dan mangga." },
            { label: "D", text: "Ibu membeli apel, jeruk, dan mangga" },
            { label: "E", text: "Ibu membeli apel, jeruk dan mangga." }
        ]
    }
]
