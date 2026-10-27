import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/content/navigation.js';
import { ROUTES } from '../src/shared/constants.js';

test('parseRoute correctly categorizes TikTok SPA routes', () => {
  assert.equal(parseRoute('/'), ROUTES.FEED);
  assert.equal(parseRoute('/foryou'), ROUTES.FEED);
  assert.equal(parseRoute('/following'), ROUTES.FEED);
  assert.equal(parseRoute('/messages'), ROUTES.MESSAGES);
  assert.equal(parseRoute('/messages/7281928374'), ROUTES.MESSAGES);
  assert.equal(parseRoute('/live'), ROUTES.LIVE);
  assert.equal(parseRoute('/live/streamer1'), ROUTES.LIVE);
  assert.equal(parseRoute('/series/drama-title'), ROUTES.SERIES);
  assert.equal(parseRoute('/drama/watch-now'), ROUTES.SERIES);
  assert.equal(parseRoute('/explore'), ROUTES.EXPLORE);
  assert.equal(parseRoute('/@itzcrih'), ROUTES.PROFILE);
  assert.equal(parseRoute('/@itzcrih/video/728192039481'), ROUTES.VIDEO);
});
