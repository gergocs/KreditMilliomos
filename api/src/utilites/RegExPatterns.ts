export class RegExPatterns {
    
    //https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    public static readonly emailValidatorPattern :RegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    
}