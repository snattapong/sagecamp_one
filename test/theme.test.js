import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { relativeTime } from '../public/features/theme.js';
import { startTestServer } from './helpers.js';

const NOW = new Date('2026-10-28T12:00:00.000Z');
const ago = (ms) => new Date(NOW.getTime() - ms);

let srv;

before(async () => {
  srv = await startTestServer();
});

after(() => srv.close());

test('relativeTime แสดง "เมื่อสักครู่" สำหรับเวลาไม่ถึง 1 นาที', () => {
  assert.equal(relativeTime(ago(30 * 1000), NOW), 'เมื่อสักครู่');
});

test('relativeTime แสดงหน่วยนาที', () => {
  assert.equal(relativeTime(ago(5 * 60 * 1000), NOW), '5 นาทีที่แล้ว');
});

test('relativeTime แสดงหน่วยชั่วโมง', () => {
  assert.equal(relativeTime(ago(3 * 60 * 60 * 1000), NOW), '3 ชั่วโมงที่แล้ว');
});

test('relativeTime แสดงหน่วยวัน (รวมเกิน 30 วัน)', () => {
  assert.equal(relativeTime(ago(2 * 24 * 60 * 60 * 1000), NOW), '2 วันที่แล้ว');
  assert.equal(relativeTime(ago(45 * 24 * 60 * 60 * 1000), NOW), '45 วันที่แล้ว');
});

test('relativeTime รับ createdAt แบบ ISO string จากข้อมูลจริงของ server', async () => {
  const res = await srv.request('GET', '/api/announcements');
  assert.equal(res.status, 200);
  const item = res.data[0];
  const later = new Date(Date.parse(item.createdAt) + 3 * 24 * 60 * 60 * 1000);
  assert.equal(relativeTime(item.createdAt, later), '3 วันที่แล้ว');
});
