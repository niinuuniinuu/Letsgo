import midtransClient from 'midtrans-client'

try {
    const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: 'sb-server-key',
        clientKey: 'sb-client-key'
    })
    console.log('✅ Midtrans Import Successful:', !!snap)
} catch (e) {
    console.error('❌ Midtrans Import Failed:', e)
}
