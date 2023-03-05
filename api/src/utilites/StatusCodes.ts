export enum StatusCodes {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    //200 - OK
    Ok = 200,
    //400 - ClientError
    Unauthorized = 401,
    NotFound = 404,

    IAmATeaPod = 418,

    // 500 - ServerError
    InternalError = 500,
    ServiceUnavailable = 503
}
