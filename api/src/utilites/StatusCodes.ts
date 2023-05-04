export enum StatusCodes {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    //200 - OK
    Ok = 200,
    NoContent = 204,

    //400 - ClientError
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,

    IAmATeaPod = 418,
    UnprocessableContent = 422,
    TooEarly = 425,

    // 500 - ServerError
    InternalError = 500,
    ServiceUnavailable = 503
}
