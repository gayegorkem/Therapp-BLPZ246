namespace Therapp.Domain.Common;

public interface IHasCreatedAt
{
    DateTime CreatedAt { get; set; }
}

public abstract class BaseEntity : IHasCreatedAt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public abstract class SoftDeletableEntity : BaseEntity
{
    public DateTime? DeletedAt { get; set; }
}
