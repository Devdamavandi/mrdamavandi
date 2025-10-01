



import { connect } from 'http2';
import fetch from 'node-fetch'


const API_URL = "http://localhost:3000/api/create-checkout-session"


// Simulated cart with the same variant
// Dummy but valid-looking data
const dummyBody = {
  items: [
    {
      name: "Test Product",
      productId: "683b0d062d51946b075e33dd",   // use a real productId from DB if required
      variantId: "68b87bffe6839aa533e5882c",   // use a real variantId if validation checks DB
      price: 2000,                             // cents or your schema’s number
      quantity: 1,
    },
  ],
  billingAddress: {
    street: "123 Test St",
    city: "Testville",
    state: "CA",
    zipCode: "90001",
    country: "US",
  },
  shippingAddress: {
    street: "123 Test St",
    city: "Testville",
    state: "CA",
    zipCode: "90001",
    country: "US",
  },
};

async function runTest() {
  const concurrency = 5;
  const requests = [];

  for (let i = 0; i < concurrency; i++) {
    requests.push(
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use one of these depending on your NextAuth setup:
          // "Authorization": `Bearer ${SESSION_TOKEN}`,
          "Cookie": `authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiMkJlN1lkalNueGxYQ1dGaFdGUTJDU21iNVBYMjZiOF93WENZNW1YcTA5cHZmRHRtZElaUWloZzVXSVU2ZmtrZlYtc2txRUVqaHA0bng5bC1NcG9SN1EifQ..jbxiEUZhrD82A1c1fL3LFw.dj698olH8k1s1lAMdfsebsgspm5891PeKCTiamso-9GcHguC6LZGJHOAkQOTRAX4dnC3EkMxoLYlEbeXt3IxPnrMwLGUqL2P-zgviI8kk0YD5_rkuQEwfXQ7NmGDgKUYVgegEW4WUTeMO0eGuuRkz17WO1Ylshj5J7HPZOxzl6kKjW9A4cPDwUP4S9KdMR8ucdS_Jna-hFYYG_hjyPTlIWdT9rAwU6ogIwSEYDjlAI4lp-QQfBSfQX_6XTb03RqCma8xFVJrJtCGax2CvrpoRKNLxb9WNG3uNoBNoJcFSDT4a02-IAZ2ZblP4MHMKGiKkoG7E_SGW7Nf0igUv55KuKHnGsLsboKIKfZIcVw7okOz6TquWDamwhpp86AnRBDDkGyqECoeF2-N1oRlWjdYnQ.7qoyjGK4HSDgq6sCSeyGfSNqwmJAao38Ne8toUxU_Yc`,
        },
        body: JSON.stringify(dummyBody),
      }).then(async (res) => {
        const text = await res.text();
        return `Request ${i + 1}: ${res.status} - ${text}`;
      })
    );
  }

  const results = await Promise.all(requests);
  console.log("=== Concurrency Test Results ===");
  results.forEach((r) => console.log(r));
}

runTest();