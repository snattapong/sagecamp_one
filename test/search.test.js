import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

let srv;

before(async () => {
  srv = await startTestServer();
});

after(async () => {
  await srv.close();
});

test('GET /api/search ค้นหาชื่อและเนื้อหาโดยไม่สนตัวพิมพ์เล็ก/ใหญ่', async () => {
  const titleMatch = await srv.request('GET', '/api/search?q=DOCKER');
  assert.equal(titleMatch.status, 200);
  assert.deepEqual(titleMatch.data.map((item) => item.id), [1]);

  const bodyMatch = await srv.request('GET', '/api/search?q=Pull%20Request');
  assert.deepEqual(bodyMatch.data.map((item) => item.id), [1]);
});

test('GET /api/search ตัดช่องว่างหัวท้ายและคืนทุกรายการเมื่อคำค้นว่าง', async () => {
  const trimmed = await srv.request('GET', '/api/search?q=%20%20DOCKER%20%20');
  assert.deepEqual(trimmed.data.map((item) => item.id), [1]);

  const all = await srv.request('GET', '/api/search');
  assert.equal(all.status, 200);
  assert.equal(all.data.length, 2);

  const whitespace = await srv.request('GET', '/api/search?q=%20%20');
  assert.equal(whitespace.data.length, 2);
});

test('GET /api/search คืน array ว่างเมื่อไม่พบ และรองรับอักขระพิเศษ', async () => {
  const missing = await srv.request('GET', '/api/search?q=zzzz');
  assert.deepEqual(missing.data, []);

  const special = await srv.request('GET', '/api/search?q=%28');
  assert.equal(special.status, 200);
  assert.deepEqual(special.data, []);
});
