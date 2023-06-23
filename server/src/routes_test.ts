import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { addDraft, loadDraft, makePick, reset, getId, Pick } from './routes';


describe('routes', function() {
  it('add', function() {
    // case: missing rounds 1
    const req1_1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {options: ['o1', 'o2'], drafters: ['d1', 'd2']}});
    const res1_1 = httpMocks.createResponse();
    addDraft(req1_1, res1_1);
    assert.strictEqual(res1_1._getStatusCode(), 400);
    assert.deepEqual(res1_1._getData(), 'missing "rounds" parameter');

    // case: missing rounds 2
    const req1_2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: undefined, options: ['o1', 'o2'], 
          drafters: ['d1', 'd2']}});
    const res1_2 = httpMocks.createResponse();
    addDraft(req1_2, res1_2);
    assert.strictEqual(res1_2._getStatusCode(), 400);
    assert.deepEqual(res1_2._getData(), 'missing "rounds" parameter');

    // case: non-number rounds 1
    const req1_3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: 'string', options: ['o1', 'o2'], 
          drafters: ['d1', 'd2']}});
    const res1_3 = httpMocks.createResponse();
    addDraft(req1_3, res1_3);
    assert.strictEqual(res1_3._getStatusCode(), 400);
    assert.deepEqual(res1_3._getData(), '"rounds" parameter must be a positive integer');

    // case: non-number rounds 2
    const req1_4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: ['NaN'], options: ['o1', 'o2'], 
          drafters: ['d1', 'd2']}});
    const res1_4 = httpMocks.createResponse();
    addDraft(req1_4, res1_4);
    assert.strictEqual(res1_4._getStatusCode(), 400);
    assert.deepEqual(res1_4._getData(), '"rounds" parameter must be a positive integer');

    // case: non-positive rounds 1
    const req1_5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '0', options: ['o1', 'o2'], 
          drafters: ['d1', 'd2']}});
    const res1_5 = httpMocks.createResponse();
    addDraft(req1_5, res1_5);
    assert.strictEqual(res1_5._getStatusCode(), 400);
    assert.deepEqual(res1_5._getData(), '"rounds" parameter must be a positive integer');

    // case: non-positive rounds 2
    const req1_6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '-1', options: ['o1', 'o2'], 
          drafters: ['d1', 'd2']}});
    const res1_6 = httpMocks.createResponse();
    addDraft(req1_6, res1_6);
    assert.strictEqual(res1_6._getStatusCode(), 400);
    assert.deepEqual(res1_6._getData(), '"rounds" parameter must be a positive integer');

    // case: missing options 1
    const req2_1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', drafters: ['d1', 'd2']}});
    const res2_1 = httpMocks.createResponse();
    addDraft(req2_1, res2_1);
    assert.strictEqual(res2_1._getStatusCode(), 400);
    assert.deepEqual(res2_1._getData(), 'missing "options" parameter');

    // case: missing options 2
    const req2_2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: undefined,
          drafters: ['d1', 'd2']}});
    const res2_2 = httpMocks.createResponse();
    addDraft(req2_2, res2_2);
    assert.strictEqual(res2_2._getStatusCode(), 400);
    assert.deepEqual(res2_2._getData(), 'missing "options" parameter');

    // case: non-array options 1
    const req2_3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: 'o1',
          drafters: ['d1', 'd2']}});
    const res2_3 = httpMocks.createResponse();
    addDraft(req2_3, res2_3);
    assert.strictEqual(res2_3._getStatusCode(), 400);
    assert.deepEqual(res2_3._getData(), '"options" must be an array of strings');

    // case: non-array options 2
    const req2_4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: 1,
          drafters: ['d1', 'd2']}});
    const res2_4 = httpMocks.createResponse();
    addDraft(req2_4, res2_4);
    assert.strictEqual(res2_4._getStatusCode(), 400);
    assert.deepEqual(res2_4._getData(), '"options" must be an array of strings');

    // case: non-string elements in option 1
    const req2_5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: [1, 2],
        drafters: ['d1', 'd2']}});
    const res2_5 = httpMocks.createResponse();
    addDraft(req2_5, res2_5);
    assert.strictEqual(res2_5._getStatusCode(), 400);
    assert.deepEqual(res2_5._getData(), '"options" must be an array of strings');

    // case: non-string elements in option 2
    const req2_6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['1', 2],
        drafters: ['d1', 'd2']}});
    const res2_6 = httpMocks.createResponse();
    addDraft(req2_6, res2_6);
    assert.strictEqual(res2_6._getStatusCode(), 400);
    assert.deepEqual(res2_6._getData(), '"options" must be an array of strings');

    // case: missing drafters 1
    const req3_1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2']}});
    const res3_1 = httpMocks.createResponse();
    addDraft(req3_1, res3_1);
    assert.strictEqual(res3_1._getStatusCode(), 400);
    assert.deepEqual(res3_1._getData(), 'missing "drafters" parameter');

    // case: missing drafters 2
    const req3_2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
          drafters: undefined}});
    const res3_2 = httpMocks.createResponse();
    addDraft(req3_2, res3_2);
    assert.strictEqual(res3_2._getStatusCode(), 400);
    assert.deepEqual(res3_2._getData(), 'missing "drafters" parameter');

    // case: non-array drafters 1
    const req3_3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
          drafters: 'd1'}});
    const res3_3 = httpMocks.createResponse();
    addDraft(req3_3, res3_3);
    assert.strictEqual(res3_3._getStatusCode(), 400);
    assert.deepEqual(res3_3._getData(), '"drafters" must be an array of strings');

    // case: non-array drafters 2
    const req3_4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
          drafters: 1}});
    const res3_4 = httpMocks.createResponse();
    addDraft(req3_4, res3_4);
    assert.strictEqual(res3_4._getStatusCode(), 400);
    assert.deepEqual(res3_4._getData(), '"drafters" must be an array of strings');

    // case: non-string elements in drafters 1
    const req3_5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
        drafters: [1, 2]}});
    const res3_5 = httpMocks.createResponse();
    addDraft(req3_5, res3_5);
    assert.strictEqual(res3_5._getStatusCode(), 400);
    assert.deepEqual(res3_5._getData(), '"drafters" must be an array of strings');

    // case: non-string elements in drafters 2
    const req3_6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
        drafters: ['d1', 2]}});
    const res3_6 = httpMocks.createResponse();
    addDraft(req3_6, res3_6);
    assert.strictEqual(res3_6._getStatusCode(), 400);
    assert.deepEqual(res3_6._getData(), '"drafters" must be an array of strings');

    // case: success 1
    const req4_1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '1', options: ['o1', 'o2'],
        drafters: ['d1', 'd2']}});
    const res4_1 = httpMocks.createResponse();
    addDraft(req4_1, res4_1);
    assert.strictEqual(res4_1._getStatusCode(), 200);
    assert.deepEqual(res4_1._getData(), {id: 1, rounds: 1, options: ['o1', 'o2'],
        drafters: ['d1', 'd2'], picks: [], currPick: 1});

    // case: success 2
    const req4_2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add', body: {rounds: '2', options: ['o1', 'o2', 'o3', 'o4'],
        drafters: ['d1', 'd2']}});
    const res4_2 = httpMocks.createResponse();
    addDraft(req4_2, res4_2);
    assert.strictEqual(res4_2._getStatusCode(), 200);
    assert.deepEqual(res4_2._getData(), {id: 2, rounds: 2, options: ['o1', 'o2', 'o3', 'o4'],
        drafters: ['d1', 'd2'], picks: [], currPick: 1});
  });

  it('load', function() {
    // case: missing id 1
    const req1_1 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {}});
    const res1_1 = httpMocks.createResponse();
    loadDraft(req1_1, res1_1);
    assert.strictEqual(res1_1._getStatusCode(), 400);
    assert.deepEqual(res1_1._getData(), 'missing "id" parameter');

    // case: missing id 2
    const req1_2 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {id: undefined}});
    const res1_2 = httpMocks.createResponse();
    loadDraft(req1_2, res1_2);
    assert.strictEqual(res1_2._getStatusCode(), 400);
    assert.deepEqual(res1_2._getData(), 'missing "id" parameter');

    // case: id not found 1
    const req2_1 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {id: '0'}});
    const res2_1 = httpMocks.createResponse();
    loadDraft(req2_1, res2_1);
    assert.strictEqual(res2_1._getStatusCode(), 400);
    assert.deepEqual(res2_1._getData(), 'draft 0 not found');

    // case: id not found 2
    const req2_2 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {id: '3'}});
    const res2_2 = httpMocks.createResponse();
    loadDraft(req2_2, res2_2);
    assert.strictEqual(res2_2._getStatusCode(), 400);
    assert.deepEqual(res2_2._getData(), 'draft 3 not found');

    // case: success 1
    const req3_1 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {id: '1'}});
    const res3_1 = httpMocks.createResponse();
    loadDraft(req3_1, res3_1);
    assert.strictEqual(res3_1._getStatusCode(), 200);
    assert.deepEqual(res3_1._getData(), {id: 1, rounds: 1, options: ['o1', 'o2'],
        drafters: ['d1', 'd2'], picks: [], currPick: 1});

    // case: success 2
    const req3_2 = httpMocks.createRequest({
      method: 'GET', url: '/api/load', query: {id: '2'}});
    const res3_2 = httpMocks.createResponse();
    loadDraft(req3_2, res3_2);
    assert.strictEqual(res3_2._getStatusCode(), 200);
    assert.deepEqual(res3_2._getData(), {id: 2, rounds: 2, options: ['o1', 'o2', 'o3', 'o4'],
        drafters: ['d1', 'd2'], picks: [], currPick: 1});
  });

  it('pick', function() {
    // case: missing id 1
    const req1_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {}, body: {pick: 'o1', drafter: 'd1'}});
    const res1_1 = httpMocks.createResponse();
    makePick(req1_1, res1_1);
    assert.strictEqual(res1_1._getStatusCode(), 400);
    assert.deepEqual(res1_1._getData(), 'missing "id" parameter');

    // case: missing id 2
    const req1_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: undefined}, body: {pick: 'o1', drafter: 'd1'}});
    const res1_2 = httpMocks.createResponse();
    makePick(req1_2, res1_2);
    assert.strictEqual(res1_2._getStatusCode(), 400);
    assert.deepEqual(res1_2._getData(), 'missing "id" parameter');

    // case: id not found 1
    const req2_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '0'}, body: {pick: 'o1', drafter: 'd1'}});
    const res2_1 = httpMocks.createResponse();
    makePick(req2_1, res2_1);
    assert.strictEqual(res2_1._getStatusCode(), 400);
    assert.deepEqual(res2_1._getData(), 'draft 0 not found');

    // case: id not found 2
    const req2_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '3'}, body: {pick: 'o1', drafter: 'd1'}});
    const res2_2 = httpMocks.createResponse();
    makePick(req2_2, res2_2);
    assert.strictEqual(res2_2._getStatusCode(), 400);
    assert.deepEqual(res2_2._getData(), 'draft 3 not found');

    // case: missing pick 1
    const req3_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {drafter: 'd1'}});
    const res3_1 = httpMocks.createResponse();
    makePick(req3_1, res3_1);
    assert.strictEqual(res3_1._getStatusCode(), 400);
    assert.deepEqual(res3_1._getData(), 'missing "pick" parameter');
    
    // case: missing pick 2
    const req3_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: undefined, drafter: 'd1'}});
    const res3_2 = httpMocks.createResponse();
    makePick(req3_2, res3_2);
    assert.strictEqual(res3_2._getStatusCode(), 400);
    assert.deepEqual(res3_2._getData(), 'missing "pick" parameter');

    // case: option not found 1
    const req4_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o0', drafter: 'd1'}});
    const res4_1 = httpMocks.createResponse();
    makePick(req4_1, res4_1);
    assert.strictEqual(res4_1._getStatusCode(), 400);
    assert.deepEqual(res4_1._getData(), 'option o0 not found');

    // case: option not found 2
    const req4_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o4', drafter: 'd1'}});
    const res4_2 = httpMocks.createResponse();
    makePick(req4_2, res4_2);
    assert.strictEqual(res4_2._getStatusCode(), 400);
    assert.deepEqual(res4_2._getData(), 'option o4 not found');

    // case: missing drafter 1
    const req5_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o1'}});
    const res5_1 = httpMocks.createResponse();
    makePick(req5_1, res5_1);
    assert.strictEqual(res5_1._getStatusCode(), 400);
    assert.deepEqual(res5_1._getData(), 'missing "drafter" parameter');
    
    // case: missing drafter 2
    const req5_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o1', drafter: undefined}});
    const res5_2 = httpMocks.createResponse();
    makePick(req5_2, res5_2);
    assert.strictEqual(res5_2._getStatusCode(), 400);
    assert.deepEqual(res5_2._getData(), 'missing "drafter" parameter');

    // case: drafter not found 1
    const req6_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o1', drafter: 'd0'}});
    const res6_1 = httpMocks.createResponse();
    makePick(req6_1, res6_1);
    assert.strictEqual(res6_1._getStatusCode(), 400);
    assert.deepEqual(res6_1._getData(), 'drafter d0 not found');

    // case: drafter not found 2
    const req6_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o1', drafter: 'd3'}});
    const res6_2 = httpMocks.createResponse();
    makePick(req6_2, res6_2);
    assert.strictEqual(res6_2._getStatusCode(), 400);
    assert.deepEqual(res6_2._getData(), 'drafter d3 not found');

    // case: success 1
    const pick1: Pick = {
      num: 1,
      pick: 'o1',
      drafter: 'd1'
    }
    const req7_1 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o1', drafter: 'd1'}});
    const res7_1 = httpMocks.createResponse();
    makePick(req7_1, res7_1);
    assert.strictEqual(res7_1._getStatusCode(), 200);
    assert.deepEqual(res7_1._getData(), {id: 1, rounds: 1, options: ['o2'],
        drafters: ['d1', 'd2'], picks: [pick1], currPick: 2});
    
    // case: success 2
    const pick2: Pick = {
      num: 2,
      pick: 'o2',
      drafter: 'd2'
    }
    const req7_2 = httpMocks.createRequest({
      method: 'POST', url: '/api/pick', query: {id: '1'}, body: {pick: 'o2', drafter: 'd2'}});
    const res7_2 = httpMocks.createResponse();
    makePick(req7_2, res7_2);
    assert.strictEqual(res7_2._getStatusCode(), 200);
    assert.deepEqual(res7_2._getData(), {id: 1, rounds: 1, options: [],
        drafters: ['d1', 'd2'], picks: [pick1, pick2], currPick: 3});
  });

  it('id', function() {
    // case: non-empty map
    assert.deepEqual(getId(), 3);

    reset();

    // case: empty map
    assert.deepEqual(getId(), 1);
    reset();
  });
});
