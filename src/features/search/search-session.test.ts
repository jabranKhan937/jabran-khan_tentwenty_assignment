import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSearchSession, takeSearchResult } from './search-session.ts';

test('a newer search cancels the previous request', () => {
  const session = createSearchSession();
  const first = session.begin();
  const second = session.begin();

  assert.equal(first.signal.aborted, true);
  assert.equal(second.signal.aborted, false);
  assert.equal(session.isCurrent(first.id), false);
  assert.equal(session.isCurrent(second.id), true);
});

test('a slower response for an older query is dropped', async () => {
  const session = createSearchSession();
  let releaseFirst: (value: string) => void = () => {};
  const firstResponse = new Promise<string>((resolve) => {
    releaseFirst = resolve;
  });
  const first = session.begin();
  const settledFirst = firstResponse.then((value) => takeSearchResult(session, first.id, value));

  const second = session.begin();
  const settledSecond = Promise.resolve('tim').then((value) => takeSearchResult(session, second.id, value));

  releaseFirst('t');

  assert.equal(await settledFirst, null);
  assert.equal(await settledSecond, 'tim');
});
