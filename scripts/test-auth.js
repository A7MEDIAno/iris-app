async function testAuth() {
  // Test 1: Uautorisert tilgang
  const res1 = await fetch('http://localhost:3000/api/orders')
  console.assert(res1.status === 401, 'Should require auth')
  
  // Test 2: Med auth
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@test.com', password: 'test' })
  })
  
  // osv...
}