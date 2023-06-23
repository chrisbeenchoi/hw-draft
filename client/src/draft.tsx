import React, { Component, ChangeEvent } from "react";
import { Draft } from "./app";

// Details user identity and draft being accessed
interface DraftProps {
    // Name of draft user
    drafter: string;

    // Draft displayed
    draft: Draft;
}

// Details draft and user status
interface DraftState {
    // Name of draft user
    drafter: string;

    // Draft displayed
    draft: Draft;

    // Whether it is the user's turn to pick
    myTurn: boolean;

    // The drafter currently making a pick, if any
    currDrafter?: string;

    // The draft option chosen by the user, if any
    pick?: string;

    // Whether the draft is finished (all rounds completed)
    complete: boolean;
}

/**
 * Displays current draft state with draft pick functionality on user's turn.
 * Takes in DraftProps, DraftState interfaces to display draft.
 */
export class DraftClass extends Component<DraftProps, DraftState> {

    // Creates a draft page with given props, state.
    constructor(props: any) {
        // AF: obj = this.state.draft
        super(props);
        this.state = { drafter: props.drafter, draft: props.draft, myTurn: false, complete: false }
    }

    // Immediately checks draft completion and whether it is the user's turn when displaying draft.
    componentDidMount(): void {
        this.checkComplete();
        this.getMyTurn();
    }

    /**
     * Displays draft status and, depending on whether it is the user's turn, draft options to select from.
     * @returns element displaying draft state
     */
    render = (): JSX.Element => {
        const pickElements: JSX.Element[] = [];
        for (const pick of this.state.draft.picks) {
            pickElements.push(
                <li>
                    <label>Pick {pick.num}: {pick.pick} picked by {pick.drafter}</label>
                </li>
            )
        }
        if (pickElements.length === 0) {
            pickElements.push(
                <label>No picks made yet.</label>
            )
        }
        if (this.state.complete) {
            return <div>
                <h3>Status of Draft "{this.state.draft.id}"</h3>
                <ul>{pickElements}</ul>
                <div>
                    <label>Draft is complete.</label>
                </div>
            </div>
        } else {
            if (this.state.myTurn) {
                const optionElements: JSX.Element[] = [];
                for (const option of this.state.draft.options) {
                    optionElements.push(
                        <option key={option} value={option}>{option}</option>
                    )
                }
                return <div>
                <h3>Status of Draft "{this.state.draft.id}"</h3>
                <div>
                    <ul>{pickElements}</ul>
                </div>
                <div>
                    <label>It's your pick!</label>
                </div>
                <div>
                    <select onChange={this.handlePickChange}>{optionElements}</select>
                    <button type="button" onClick={this.handlePick}>Draft</button>
                </div>
                </div>
            } else {
                return <div>
                    <h3>Status of Draft "{this.state.draft.id}"</h3>
                    <ul>{pickElements}</ul>
                    <label>Waiting for {this.state.currDrafter} to pick.</label>
                    <div>
                        <button type="button" onClick={this.handleRefresh}>Refresh</button>
                    </div>
                </div>
            }
        }
    }

    // Determines the current drafter and whether it is currently the user's turn to pick.
    getMyTurn = (): void => {
        if (!this.state.complete) {
            const i: number = (this.state.draft.currPick - 1)%this.state.draft.drafters.length;
            const drafter: string = this.state.draft.drafters[i];

            if (drafter === this.state.drafter) {
                this.setState({ currDrafter: drafter, myTurn: true, pick: this.state.draft.options[0] });
            } else {
                this.setState({ currDrafter: drafter, myTurn: false });
            }
        }
    }

    // Determines whether the draft is finished.
    checkComplete = (): void => {
        let rounds = this.state.draft.rounds;
        let drafters = this.state.draft.drafters.length;
        let picks = this.state.draft.picks.length;
        if (picks === rounds * drafters)
            this.setState({ complete: true })
    }

    // Updates pick value based on user selection.
    handlePickChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
        const pick = evt.target.value as string;
        this.setState({ pick: pick });
    }

    // Given a selected pick, updates draft to reflect pick made.
    handlePick = (): void => {
        if (this.state.pick === undefined) {
            alert("Must make a pick to draft!");
            return;
        }
        const id = this.state.draft.id;
        const url = "/api/pick?id=" + encodeURIComponent(id.toString());
        fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pick: this.state.pick,
              drafter: this.state.drafter
            })
          }).then(this.handlePickResponse).catch(this.handleServerError);
    }

    /**
     * Makes sure user pick successfully goes through.
     * @param res 200 if pick successful, errors otherwise
     */
    handlePickResponse = (res: Response) => {
        if (res.status === 200) {
            res.json().then(this.handlePickJson).catch(this.handleServerError);
          } else {
            alert('Invalid draft pick')
            this.handleServerError(res);
          }
    }
    
    /**
     * Given valid updated draft data, updates draft state to reflect pick made.
     * @param data updated draft data
     */
    handlePickJson = (data: any) => {
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
            const i: number = (draft.currPick - 1)%draft.drafters.length;
            const drafter: string = draft.drafters[i];
            const rounds = draft.rounds;
            const drafters = draft.drafters.length;
            const picks = draft.picks.length;
            const complete: boolean = (picks === rounds * drafters);
            this.setState({ draft: draft, myTurn: false, currDrafter: drafter, complete: complete });
        }
    }

    // Updates display to reflect current state of draft.
    handleRefresh = () => {
        const url = "api/load?id=" + encodeURIComponent(this.state.draft.id.toString());
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(this.handleRefreshResponse).catch(this.handleServerError);
    }

    /**
     * Makes sure draft update for display successful.
     * @param res 200 if update successful, errors otherwise
     */
    handleRefreshResponse = (res: Response) => {
        if (res.status === 200) {
          res.json().then(this.handleRefreshJson).catch(this.handleServerError);
          this.checkComplete();
          this.getMyTurn();
        } else {
          alert('Invalid Draft ID');
          this.handleServerError(res);
        }
    }
    
    /**
     * Updates display with refreshed draft, errors for invalid draft data.
     * @param data details most recent state of draft
     */
    handleRefreshJson = (data: any) => {
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
            const rounds = draft.rounds;
            const drafters = draft.drafters.length;
            const picks = draft.picks.length;
            const complete: boolean = (picks === rounds * drafters);
            const i: number = (draft.currPick - 1)%draft.drafters.length;
            const drafter: string = draft.drafters[i];
            const myTurn: boolean = (drafter===this.state.drafter);
            if (!complete) {
                this.setState({ draft: draft, complete: complete, currDrafter: drafter, myTurn: myTurn, pick: draft.options[0] });
            }
            else {
                this.setState({ draft: draft, complete: complete, myTurn: myTurn });
            }
        }
    }

    /** Communicates error for any unsuccessful server operations. */
    handleServerError = (res: Response) => {
        console.error("unknown error talking to server in draft: " + res);
    }
}