class GameException extends Error {
    win: boolean
    constructor(msg: string, win = false) {
        super(msg);
        this.win = win

        Object.setPrototypeOf(this, GameException.prototype);
    }
}
