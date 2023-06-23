import { Request, Response } from "express";

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string|undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}

// Description of an individual pick made in a draft
// RI: num is a positive integer
export type Pick = {
  num: number,
  pick: string,
  drafter: string
}

// Description of an individual draft
// RI: id, rounds are positive integers
//     options.length >= drafters.length * rounds
type Draft = {
  id: number,
  rounds: number,
  options: string[],
  drafters: string[],
  picks: Pick[],
  currPick: number,
}

// Maps from draft id to draft details.
let drafts: Map<number, Draft> = new Map();

// Adds a draft to the list.
export function addDraft(req: Request, res: Response) {
  let rounds = first(req.body.rounds);
  if (rounds === undefined) {
    res.status(400).send('missing "rounds" parameter');
    return;
  } else if (isNaN(parseInt(rounds, 10)) || parseInt(rounds, 10) < 1) {
    res.status(400).send('"rounds" parameter must be a positive integer');
    return;
  }

  const options: string[] = req.body.options;
  if (options === undefined) {
    res.status(400).send('missing "options" parameter');
    return;
  } else if (!Array.isArray(options) || !options.every((option) => typeof option === 'string')) {
    res.status(400).send('"options" must be an array of strings');
    return;
  }

  const drafters = req.body.drafters;
  if (drafters === undefined) {
    res.status(400).send('missing "drafters" parameter');
    return;
  } else if (!Array.isArray(drafters) || !drafters.every((drafter) => typeof drafter === 'string')) {
    res.status(400).send('"drafters" must be an array of strings');
    return;
  }

  const picks: Pick[] = [];

  const id: number = getId();

  const draft: Draft = {
    id: id,
    rounds: parseInt(rounds, 10),
    options: options,
    drafters: drafters,
    picks: picks,
    currPick: 1
  }
  drafts.set(draft.id, draft);
  console.log(draft);
  res.status(200).send(draft);
}

// Delivers current draft details.
export function loadDraft(req: Request, res: Response) {
  const id = first(req.query.id);
  if (id === undefined) {
    res.status(400).send('missing "id" parameter');
    return;
  } else if (!drafts.has(parseInt(id, 10))) {
    res.status(400).send('draft ' + id + ' not found');
    return;
  } else {
    res.status(200).send(drafts.get(parseInt(id, 10)));
  }
}

// Takes in pick made to update draft state.
export function makePick(req: Request, res: Response) {
  const id = first(req.query.id);
  if (id === undefined) {
    res.status(400).send('missing "id" parameter');
    return;
  } 
  
  const draft = drafts.get(parseInt(id, 10));
  if (draft === undefined) {
    res.status(400).send('draft ' + id + ' not found');
    return;
  }

  const pick = first(req.body.pick);
  if (pick === undefined) {
    res.status(400).send('missing "pick" parameter');
    return;
  }

  if (!draft.options.includes(pick)) {
    res.status(400).send('option ' + pick + ' not found');
    return;
  }

  const drafter = first(req.body.drafter);
  if (drafter === undefined) {
    res.status(400).send('missing "drafter" parameter');
    return;
  }

  if (!draft.drafters.includes(drafter)) {
    res.status(400).send('drafter ' + drafter + ' not found');
    return;
  }

  const newPick: Pick = {
    num: draft.currPick,
    pick: pick,
    drafter: drafter
  }

  let picks = draft.picks;
  picks.push(newPick);
  draft.picks = picks;

  let curr = draft.currPick;
  curr = curr + 1;
  draft.currPick = curr;

  let options = draft.options
  const newOptions = options.filter((element) => element !== pick);
  draft.options = newOptions

  drafts.set(parseInt(id, 10), draft);

  res.status(200).send(drafts.get(parseInt(id, 10)));
}

// Returns a unique id value.
export function getId(): number {
  let id: number = drafts.size + 1;
  while (drafts.has(id)) {
    id = id + 1;
  }
  return id;
}

// Clears stored drafts.
export function reset() {
  drafts = new Map();
}