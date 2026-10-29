import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test('PATCH แก้หัวข้อได้ และ body คงค่าเดิม', async () => {
  const srv = await startTestServer();
  const before = (await srv.request('GET', '/api/announcements/1')).data;
  const res = await srv.request('PATCH', '/api/announcements/1', { title: 'Updated title' });
  assert.equal(res.status, 200);
  assert.equal(res.data.title, 'Updated title');
  assert.equal(res.data.body, before.body);
  await srv.close();
});

test('PATCH แก้ body อย่างเดียวได้ และ title คงค่าเดิม', async () => {
  const srv = await startTestServer();
  const before = (await srv.request('GET', '/api/announcements/1')).data;
  const res = await srv.request('PATCH', '/api/announcements/1', { body: 'รายละเอียดใหม่' });
  assert.equal(res.status, 200);
  assert.equal(res.data.title, before.title);
  assert.equal(res.data.body, 'รายละเอียดใหม่');
  await srv.close();
});

test('PATCH ไม่บันทึกฟิลด์อื่นที่ส่งมา (id, pinned)', async () => {
  const srv = await startTestServer();
  const res = await srv.request('PATCH', '/api/announcements/1', { title: 'Again', id: 99, pinned: true });
  assert.equal(res.status, 200);
  assert.equal(res.data.id, 1);
  assert.equal('pinned' in res.data, false);
  await srv.close();
});

test('PATCH หัวข้อว่าง → 400', async () => {
  const srv = await startTestServer();
  const res = await srv.request('PATCH', '/api/announcements/1', { title: '   ' });
  assert.equal(res.status, 400);
  assert.ok(res.data.error);
  await srv.close();
});

test('PATCH ไม่พบประกาศ → 404', async () => {
  const srv = await startTestServer();
  const res = await srv.request('PATCH', '/api/announcements/9999', { title: 'x' });
  assert.equal(res.status, 404);
  assert.ok(res.data.error);
  await srv.close();
});
