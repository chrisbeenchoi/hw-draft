import React, { Component, ChangeEvent } from "react";
import { DraftClass } from "./draft";

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
export type Draft = {
  id: number,
  rounds: number,
  options: string[],
  drafters: string[],
  picks: Pick[],
  currPick: number
}

interface AppState {
  /** Draft to display, assigned upon valid joining or creation of draft */
  currDraft?: Draft

  /** Identifies draft user */
  drafter?: string;

  /** ID of draft to display, if any */
  id?: number;

  /** Desired number of rounds given by draft creator */
  rounds?: number;

  /** Desired options given by draft creator */
  options?: string;

  /** Desired drafters given by draft creator */
  drafters?: string;
}

/**
 * Component displaying options to join or create a draft. Upon selecting a draft, users
 * can view the current state of said draft and make picks on their turns.
 * Takes in AppState interface
 */
export class App extends Component<{}, AppState> {

  // Creates app with given state
  constructor(props: any) {
    // AF: obj = this.state.currDraft?
    super(props);
    this.state = { rounds: 3 };
  }
  
  /**
   * Displays screen with options to fill in necessary information to join or 
   * create a draft.
   * @returns start screen
   */
  render = (): JSX.Element => {
    if (this.state.currDraft !== undefined && this.state.drafter) {
      return <DraftClass draft={this.state.currDraft} drafter={this.state.drafter}/>
    } else {
      return <div>
        <label htmlFor="drafter">Drafter (required): </label>
          <input id="drafter" type="text" value={this.state.drafter} 
            onChange={this.handleDrafterChange}></input>
          <div>
            <div>
              <h3>Join Existing Draft</h3>
              <label htmlFor="id">Draft ID: </label>
              <input id="id" type="number" value={this.state.id} style={{ width: '125px' }}
                  onChange={this.handleIdChange}></input>
            </div>
            <button type="button" onClick={this.handleJoin}>Join</button>
          </div>
          <div>
            <h3>Create New Draft</h3>
            <label htmlFor="rounds">Rounds: </label>
            <input id="rounds" type="number" value={this.state.rounds} style={{ width: '50px' }}
                  min={1} onChange={this.handleRoundsChange}></input>
          </div>
          <div>
            <label>Options (one per line), </label>
            <label>Drafters (one per line, in order): </label>
          </div>
          <div>
            <textarea id="options" rows={20} onChange={this.handleOptionsChange}></textarea>
            <textarea id="drafters" rows={20} onChange={this.handleDraftersChange}></textarea>
          </div>
          <button type="button" onClick={this.handleCreate}>Create</button>
        </div>
    }
  }

  /**
   * Updates name of drafter joining or creating draft.
   * @param evt user edits input field
   */
  handleDrafterChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({drafter: evt.target.value});
  }

  /**
   * Updates id used to join draft.
   * @param evt user edits input field
   */
  handleIdChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({id: parseInt(evt.target.value, 10)});
  }

  /**
   * Updates number of rounds used to create draft.
   * @param evt user edits input field
   */
  handleRoundsChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({rounds: parseInt(evt.target.value, 10)});
  }

  /**
   * Updates options used to create draft.
   * @param evt user edits input field
   */
  handleOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ options: evt.target.value });
  }

  /**
   * Updates drafters used to create draft.
   * @param evt user edits input field
   */
  handleDraftersChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ drafters: evt.target.value });
  }

  /** Given a valid drafter name and draft id, joins draft corresponding to id. */
  handleJoin = (): void => {
    if (this.state.drafter === undefined) {
      alert('Drafter name required!');
      return;
    }
    if (this.state.id === undefined) {
      alert('Draft ID required!');
      return;
    }
    const url = "api/load?id=" + encodeURIComponent(this.state.id.toString());
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(this.handleJoinResponse).catch(this.handleServerError);
  }

  /**
   * Makes sure drafter successfully joins draft
   * @param res status 200 if successful, errors otherwise
   */
  handleJoinResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleJoinJson).catch(this.handleServerError);
    } else {
      alert('Invalid Draft ID')
      this.handleServerError(res);
    }
  }

  /**
   * Updates app with draft joined, errors for invalid draft data.
   * @param data draft joined by user
   */
  handleJoinJson = (data: any) => {
    if (data === null) {
      console.error("Invalid data: ", data);
    } else {
      const draft: Draft = {
        id: data.id,
        rounds: data.rounds,
        options: data.options,
        drafters: data.drafters,
        picks: data.picks,
        currPick: data.currPick
      }
      this.setState({ currDraft: draft });
    }
  }

  /**
   * Given a valid drafter name, rounds, options, and drafter, creates a new draft.
   */
  handleCreate = (): void => {
    if (this.state.drafter === undefined) {
      alert('Drafter name required!');
      return;
    }
    if (this.state.rounds === undefined || this.state.rounds < 1) {
      alert('Round count (positive integer) required!');
      return;
    }

    if (this.state.options === undefined) {
      alert("Options required for draft!");
      return;
    }

    if (this.state.drafters === undefined) {
      alert("Drafters required for draft!");
      return;
    }

    const options = this.state.options.split('\n');
    const drafters = this.state.drafters.split('\n');

    if (drafters.length < 2) {
      alert("Multiple drafters required!");
      return;
    }

    if (options.length < this.state.rounds * drafters.length) {
      alert("Not enough options for given drafters / rounds!");
      return;
    }

    const url = "/api/add";
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rounds: JSON.stringify(this.state.rounds),
        options: options,
        drafters: drafters
      })
    }).then(this.handleCreateResponse).catch(this.handleServerError);
  }

  /**
   * Makes sure draft successfully created.
   * @param res 200 if creation successful, errors otherwise
   */
  handleCreateResponse = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleJoinJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  /** Communicates error for any unsuccessful server operations. */
  handleServerError = (res: Response) => {
    console.error("unknown error talking to server in app: " + res);
  }
}
