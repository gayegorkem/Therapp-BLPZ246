namespace Therapp.Application.Common;

public class Result<T>
{
    public bool Success { get; init; }
    public T? Value { get; init; }
    public Error? Error { get; init; }

    public static Result<T> Ok(T value) => new() { Success = true, Value = value };
    public static Result<T> Fail(Error error) => new() { Success = false, Error = error };
}

public class Result
{
    public bool Success { get; init; }
    public Error? Error { get; init; }

    public static Result Ok() => new() { Success = true };
    public static Result Fail(Error error) => new() { Success = false, Error = error };
}
