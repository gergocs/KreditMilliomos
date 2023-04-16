class TrustedTokenHandler {
    private static trustedTokenHandler: TrustedTokenHandler
    private tokens = new Map<string, number>()
    private readonly minuteToMilliSec = 60000

    private constructor() {
    }

    public static instance() {
        if (!this.trustedTokenHandler) {
            this.trustedTokenHandler = new TrustedTokenHandler()
        }

        return this.trustedTokenHandler
    }

    public addToken(token: string) {
        this.tokens.set(token, Date.now() + (15 * this.minuteToMilliSec))
    }

    public isValidToken(token: string): boolean {
        // @ts-ignore
        return this.tokens.has(token) && this.tokens.get(token) > Date.now()
    }
}

export default TrustedTokenHandler
