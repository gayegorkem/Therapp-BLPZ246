using FluentValidation;
using Therapp.Application.Reports.Dtos;

namespace Therapp.Application.Validators;

public class CreateReportDtoValidator : AbstractValidator<CreateReportDto>
{
    public CreateReportDtoValidator()
    {
        RuleFor(x => x.TargetType).IsInEnum();
        RuleFor(x => x.Reason).IsInEnum();
        RuleFor(x => x.TargetId).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
