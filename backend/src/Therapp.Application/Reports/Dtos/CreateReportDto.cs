using Therapp.Domain.Enums;

namespace Therapp.Application.Reports.Dtos;

public class CreateReportDto
{
    public ReportTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public ReportReason Reason { get; set; }
    public string? Description { get; set; }
}
