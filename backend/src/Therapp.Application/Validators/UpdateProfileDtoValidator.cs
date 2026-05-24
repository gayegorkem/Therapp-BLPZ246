using FluentValidation;
using Therapp.Application.Users.Dtos;

namespace Therapp.Application.Validators;

public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
{
    public UpdateProfileDtoValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty().Length(2, 64);
        RuleFor(x => x.Bio)
            .MaximumLength(280);
        RuleFor(x => x.AvatarUrl)
            .MaximumLength(500);
    }
}
