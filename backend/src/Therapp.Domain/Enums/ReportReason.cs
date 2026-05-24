namespace Therapp.Domain.Enums;

public enum ReportReason : short
{
    Spam = 0,
    Harassment = 1,
    SelfHarm = 2,
    Misinformation = 3,
    HateSpeech = 4,
    SexualContent = 5,
    Other = 99
}
