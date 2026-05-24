using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Common;
using Therapp.Application.Reports.Dtos;
using Therapp.Domain.Entities;
using Therapp.Domain.Enums;

namespace Therapp.Application.Reports;

public class ReportService : IReportService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _current;

    public ReportService(IAppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<Result> CreateAsync(CreateReportDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        // Validate target exists
        var exists = dto.TargetType switch
        {
            ReportTargetType.Post    => await _db.Posts.AnyAsync(p => p.Id == dto.TargetId, ct),
            ReportTargetType.Comment => await _db.Comments.AnyAsync(c => c.Id == dto.TargetId, ct),
            ReportTargetType.User    => await _db.Users.AnyAsync(u => u.Id == dto.TargetId, ct),
            _ => false
        };
        if (!exists) return Result.Fail(Errors.NotFound("Hedef"));

        // Prevent duplicate pending reports by same user for same target
        var duplicate = await _db.Reports.AnyAsync(r =>
            r.ReporterUserId == userId &&
            r.TargetType == dto.TargetType &&
            r.TargetId == dto.TargetId &&
            r.Status == ReportStatus.Pending, ct);
        if (duplicate) return Result.Fail(Errors.Conflict("Bu içeriği zaten raporladınız."));

        _db.Reports.Add(new Report
        {
            ReporterUserId = userId.Value,
            TargetType = dto.TargetType,
            TargetId = dto.TargetId,
            Reason = dto.Reason,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Status = ReportStatus.Pending
        });
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }
}
