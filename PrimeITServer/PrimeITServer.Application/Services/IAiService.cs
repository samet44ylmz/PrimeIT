using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Services;

public interface IAiService
{
    Task<(int Score, string Evaluation)> EvaluateApplicationAsync(
        string jobDescription, 
        string candidateAnswersJson, 
        string candidateProfile, 
        CancellationToken cancellationToken);
}
