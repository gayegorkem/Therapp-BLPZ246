using Therapp.Application.Common;

namespace Therapp.Application.Posts.Dtos;

public enum FeedSort
{
    New = 0,
    Popular = 1
}

public class FeedQuery : PagedQuery
{
    public FeedSort Sort { get; set; } = FeedSort.New;
}
