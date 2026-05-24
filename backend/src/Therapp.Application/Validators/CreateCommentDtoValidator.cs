using FluentValidation;
using Therapp.Application.Comments.Dtos;

namespace Therapp.Application.Validators;

public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
{
    public CreateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Yorum boş olamaz.")
            .MinimumLength(2).WithMessage("Yorum çok kısa.")
            .MaximumLength(1000).WithMessage("Yorum en fazla 1000 karakter olabilir.");
    }
}
