using Therapp.Application.Common;
using Therapp.Application.Reports.Dtos;

namespace Therapp.Application.Reports;

public interface IReportService
{
    Task<Result> CreateAsync(CreateReportDto dto, CancellationToken ct);
}
