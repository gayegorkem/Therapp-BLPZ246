using FluentValidation;
using Therapp.Application.Posts.Dtos;

namespace Therapp.Application.Validators;

public class CreatePostDtoValidator : AbstractValidator<CreatePostDto>
{
    public CreatePostDtoValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Kategori seçmelisin.");
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Başlık zorunlu.")
            .Length(3, 150).WithMessage("Başlık 3-150 karakter olmalı.");
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("İçerik zorunlu.")
            .MinimumLength(10).WithMessage("İçerik en az 10 karakter olmalı.")
            .MaximumLength(5000).WithMessage("İçerik en fazla 5000 karakter olabilir.");
    }
}

public class UpdatePostDtoValidator : AbstractValidator<UpdatePostDto>
{
    public UpdatePostDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().Length(3, 150);
        RuleFor(x => x.Content)
            .NotEmpty().MinimumLength(10).MaximumLength(5000);
    }
}
